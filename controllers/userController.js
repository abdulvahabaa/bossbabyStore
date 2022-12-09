const { response } = require("express");
const { create } = require("hbs");
const { AwsInstance } = require("twilio/lib/rest/accounts/v1/credential/aws");
const addressHelper = require("../helpers/addressHelper");
const cartHelper = require("../helpers/cartHelper");
const orderHelper = require("../helpers/orderHelper");
const productHelper = require("../helpers/productHelper");
const userHelper = require("../helpers/userHelper");
const wishlistHelper = require("../helpers/wishlistHelper");
const bannerHelper = require("../helpers/bannerHelper");
const referralCodeGenerator = require("referral-code-generator");
const paypal = require("paypal-rest-sdk");
const couponHelper = require("../helpers/couponHelper");
const { Db } = require("mongodb");
const {
  CustomerProfilesChannelEndpointAssignmentContext,
} = require("twilio/lib/rest/trusthub/v1/customerProfiles/customerProfilesChannelEndpointAssignment");

const ClientId =process.env.CLIENT_ID
 const ClientSecret= process.env.CLIENT_SCECRET


paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:ClientId,
  client_secret:ClientSecret,
});

const client = require("twilio")(userHelper.accountSID, userHelper.authToken);

module.exports = {
  homepage: async (req, res, next) => {
    try {
      let user = req.session.user;
      console.log(user);
      console.log("================session==================");
      console.log(req.session);
      console.log("================session==================");

      let cartCount = null;
      if (req.session.user) {
        cartCount = await cartHelper.getCartCount(req.session.user._id);
      }

      productHelper.getAllproducts().then(async (products) => {
        let banner = await bannerHelper.getAllbanners();
        res.render("user/home", {
          user,
          User: true,
          products,
          cartCount,
          banner,
        });
      });
    } catch (error) {
      console.log(error);
    }
  },

  loginPage: (req, res, next) => {
    if (req.session.loggedIn) {
      return res.redirect("/");
    } else {
      res.render("user/login", {
        User: true,
        loginErr: req.session.loginErr,
        block: req.session.block,
      });
      req.session.loginErr = false;
      req.session.block = false;
    }
  },

  login: (req, res) => {
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        return res.redirect("/");
      } else if (response.block) {
        req.session.block = true;
        res.redirect("/login");
      } else {
        req.session.loginErr = true;

        res.redirect("/login");
      }
    });
  },

  signupPage: (req, res, next) => {
    res.render("user/signup");
  },

  signup: (req, res) => {
    try {
      userHelper.doSignup(req.body).then((response) => {
        console.log(response);
        res.redirect("/login");
      });
    } catch (error) {
      console.log(error);
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },

  otploginpage: (req, res) => {
    res.render("user/otpLogin");
  },

  otpverifypage: (req, res) => {
    res.render("user/otpVerify");
  },

  otplogin: (req, res) => {
    console.log("===============req.body=================");
    console.log(req.body);
    userHelper.doOtpLogin(req.body.phone).then((response) => {
      console.log("==================response==========");
      console.log(response);
      if (response) {
        client.verify
          .services(userHelper.serviceID)
          .verifications.create({
            to: `+91${req.body.phone}`,
            channel: "sms",
          })
          .then((data) => {
            req.session.phone = data.to;
            res.redirect("/otpVerify");
          });
        req.session.user = response.user;
      } else {
        req.session.invalidNumber = "Number is not Registered";
        res.redirect("/otpLogin");
      }
    });
  },

  otpVerify: (req, res) => {
    console.log(req.body);
    var arr = Object.values(req.body);
    var otp = arr.toString().replaceAll(",", "");
    console.log(otp);
    client.verify
      .services(userHelper.serviceID)
      .verificationChecks.create({
        to: req.session.phone,
        code: otp,
      })
      .then((data) => {
        console.log(data);
        if (data.valid) {
          req.session.loggedIn = true;
          res.redirect("/");
        } else {
          req.session.otpfail = "wrong";
          res.redirect("/otpVerify");
        }
      });
  },

  cart: async (req, res) => {
    let products = "";
    let totalValue = "";
    let totalAfterDiscount = "";
    let totalDiscount = "";
    if (req.session.loggedIn) {
      let cartCount = await cartHelper.getCartCount(req.session.user._id);
      if (cartCount != 0) {
        products = await cartHelper.getCartProducts(req.session.user._id);
        totalValue = await cartHelper.getTotalAmount(req.session.user._id);
        totalAfterDiscount = await cartHelper.getTotalPriceAfterDiscount(
          req.session.user._id
        );
        totalDiscount = await cartHelper.getTotalDiscountedAmount(
          req.session.user._id
        );
      }
    }

    console.log(products);
    console.log(totalValue);
    console.log(totalAfterDiscount);
    console.log(totalDiscount);
    res.render("user/cart", {
      User: true,
      user: req.session.user,
      products,
      totalValue,
      totalDiscount,
      totalAfterDiscount,
    });
  },

  addTocart: (req, res) => {
    console.log("*******************api call***************");
    cartHelper.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  },

  deleteToCart: (req, res) => {
    let proId = req.params.id;
    let userId = req.session.user._id;
    cartHelper.deleteToCart(proId, userId).then((response) => {
      console.log(response);
      res.json({ status: true });
    });
  },

  changeProdQuantity: (req, res, next) => {
    cartHelper.changeProductQuantity(req.body).then(async (response) => {
      //response.total = await cartHelper.getTotalAmount(req.body.user)
      // console.log(response);
      res.json(response);
    });
  },

  couponCheck: async (req, res) => {
    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    console.log(req.body);

    let couponcode = req.body.couponcode;
    let userId = req.session.user._id;
    let total = await cartHelper.getTotalPriceAfterDiscount(userId);
    console.log(couponcode);
    console.log(userId);
    console.log(total);
    couponHelper
      .checkCouponCode(couponcode, userId, total)
      .then((response) => {
        console.log("***************************");
        console.log(response);
        req.session.discountAmount = response.discountAmount;
        req.session.dicountedTotalPrice = response.dicountedTotalPrice;
        res.json(response);
      })
      .catch((response) => {
        res.json(response);
      });
  },

  checkout: async (req, res) => {
    // let dicountedTotalPrice = req.session.dicountedTotalPrice
    // let discountAmount = req.session.discountAmount

    // console.log(req.body);

    let total = "";
    let products = "";
    let address = "";
    let totalAfterDiscount = "";
    let totalDiscount = "";

    if (req.session.loggedIn) {
      let cartCount = await cartHelper.getCartCount(req.session.user._id);
      if (cartCount != 0) {
        address = await addressHelper.getAllAddress(req.session.user._id);
        total = await cartHelper.getTotalAmount(req.session.user._id);
        totalAfterDiscount = await cartHelper.getTotalPriceAfterDiscount(
          req.session.user._id
        );
        totalDiscount = await cartHelper.getTotalDiscountedAmount(
          req.session.user._id
        );
        products = await cartHelper.getCartProducts(req.session.user._id);
      }
    }
    // console.log(total);
    // console.log(products);
    // console.log(address);
    res.render("user/checkout", {
      User: true,
      total,
      user: req.session.user,
      products,
      address,
      totalAfterDiscount,
      totalDiscount,
    });
  },

  placeorder: async (req, res) => {
    console.log("call is coming");

    console.log(req.body);
    let products = await cartHelper.getCartProductList(req.session.user._id);
    console.log(products);
    let totalPrice = await cartHelper.getTotalPriceAfterDiscount(
      req.session.user._id
    );
    userid = req.session.user._id;

    console.log(userid);
    orderHelper.placeOrder(req.body, products, userid).then((orderId) => {
      if (req.body["typeofpayment"] === "cod") {

        console.log(req.body["typeofpayment"]);
        console.log("======= cod            ......... ======");
        res.json({ codSuccess: true });
        req.session.applyCoupon = false;
        console.log("======= cod            ......... ======");

        orderHelper.getOrderProductQuantity(orderId).then((data) => {
          data.forEach((element) => {
            productHelper.updateStockDecrease(element);
          });
        });


        // res.json({ codSuccess: true });
      } else if (req.body["typeofpayment"] === "paypal") {

        orderHelper.getOrderProductQuantity(orderId).then((data) => {
          data.forEach((element) => {
            productHelper.updateStockDecrease(element);
          });
        });
        res.json({ paypal: true, orderId: orderId });

       
      } else {

        orderHelper.genarateRazorpay(orderId, totalPrice).then((response) => {
          console.log("response===========-----------------");
          response.orderId = orderId
          console.log(response);
          orderHelper.getOrderProductQuantity(orderId).then((data) => {
            data.forEach((element) => {
              productHelper.updateStockDecrease(element);
            });
          });


          res.json(response);


        });
      }
    });
    console.log(req.body);
  },

  orderSuccess: async (req, res) => {
    console.log("[[[[[[[[[COD]]]]]]]]]");

    // orderHelper.getOrderProductQuantity(orderId).then((data) => {
    //   data.forEach((element) => {
    //     productHelper.updateStockDecrease(element);
    //   });
    // });

    await orderHelper.clearCart(req.session.user._id);
    res.render("user/orderSuccess", { User: true, user: req.session.user });
  },

  orders: async (req, res) => {
    // let orders = await orderHelper.getUserOrders(req.session.user._id)
    let orders = ''
    let address= ''
    if (req.session.loggedIn) {
      orders = await orderHelper.getOrderList(req.session.user._id);
      console.log(orders);
      console.log(orders[0].addressId);
      address = await addressHelper.getAddress(orders[0].addressId);
      }
    res.render("user/orders", {
      User: true,
      user: req.session.user,
      orders,
      address,
    });
  },

  OrderDetails: async (req, res) => {
    let orderId = req.params.id;
    let products = await orderHelper.getOrderProducts(orderId);
    console.log(products);
    res.render("user/OrderDetailes", {
      User: true,
      user: req.session.user,
      products,
    });
  },

  productCancel: async (req, res) => {
    let orderId = req.params.orderId;
    let proId = req.params.proId;
    console.log("jjjjjjjjjjjjjjjjjj");
    console.log(proId);
    let proStatus = await orderHelper.cancelProduct(proId, orderId);

    orderHelper.getOrderProductQuantity(orderId).then((data) => {
      data.forEach((element) => {
        productHelper.updateStockIncrease(element);
      });
    });

    res.redirect("/OrderDetailes/" + orderId);
  },

  productReturn: async (req, res) => {
    let orderId = req.params.orderId;
    let proId = req.params.proId;
    console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");

    let proStatus = await orderHelper.retunProduct(proId, orderId);
    console.log("$$$$$$$$$$$$$$$$");
    orderHelper.getOrderProductQuantity(orderId).then((data) => {
      data.forEach((element) => {
        productHelper.updateStockIncrease(element);
      });
    });


    res.redirect("/OrderDetailes/" + orderId);
  },

  viewOrderProducts: async (req, res) => {
    let products = await orderHelper.getOrderProducts(req.params.id);
    res.render("user/view-order-products", {
      User: true,
      user: req.session.user,
      products,
    });
  },

  verify_payment: (req, res) => {
    console.log(req.body);
    orderHelper
      .verifyPayment(req.body)
      .then(() => {
        orderHelper
          .changePaymentStatus(req.body["order[receipt]"])
          .then(() => {
            console.log("payment successful");
            res.json({ status: true });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
  },

  paypalPayment: (req, res) => {
    try {
      create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/onlineSuccess/" + req.params.id,
          cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
          {
            amount: {
              currency: "USD",
              total: "25.00",
            },
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              console.log("*************orderID****************");
              console.log(req.params.id);
              console.log("*******************************");
              res.redirect(payment.links[i].href);
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  onlineSuccess: async (req, res) => {
    try {
      console.log("********orderId success****************");
      console.log(req.params.id);
      console.log("**************************");
      await orderHelper.clearCart(req.session.user._id);
      orderHelper
        .changePaymentStatus(req.params.id)
        .then(() => {
          res.redirect("/orderSuccess");
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  },

  productview: async (req, res) => {
    let proId = req.params.id;
    let product = await productHelper.getProductDetails(proId);
    console.log("&&&&&&&&&&&*********&&&&&&&&&&");
    console.log(product);
    res.render("user/productView", { User: true, product });
  },

  addAddress: (req, res) => {
    console.log(req.body);
    addressHelper.addAddress(req.body, req.session.user._id).then((data) => {
      console.log(data);
      res.redirect("/checkout");
    });
  },

  editAddress: async (req, res) => {
    let addressId = req.params.id;
    await addressHelper.getAddress(addressId).then((address) => {
      console.log("%%%%%%%%%%%%%%%%%%%%%%%");
      console.log(address);

      res.render("user/editAddress", { User: true, address });
    });
  },

  updateAddress: async (req, res) => {
    let addressId = req.params.id;
    let userId = req.session.user._id;

    await addressHelper.updateAddress(addressId, req.body, userId).then(() => {
      res.redirect("/checkout");
    });
  },

  deleteAddress: (req, res) => {
    console.log("^^^^^^^^^^^^^^^^^^^^");
    userId = req.session.user._id;
    addressId = req.params.id;
    addressHelper.deleteAddress(userId, addressId).then((response) => {
      res.json({ staus: true });
    });
  },

  wishlist: async (req, res) => {
    let products = "";
    if (req.session.loggedIn) {
      let wishlistCount = await wishlistHelper.getWishlistCount(
        req.session.user._id
      );
      if (wishlistCount != 0) {
        products = await wishlistHelper.getWishlistProducts(
          req.session.user._id
        );
      }
    }
    // console.log(wishlistCount);
    console.log(products);

    res.render("user/wishlist", {
      User: true,
      user: req.session.user,
      products,
    });
  },

  addToWishlist: (req, res) => {
    console.log("*******************api call***************");

    wishlistHelper
      .addToWishlist(req.params.id, req.session.user._id)
      .then(() => {
        res.json({ status: true });
      });
  },

  deleteWishlist: (req, res) => {
    console.log("333333333334444444444444433333333");
    let proId = req.params.id;

    wishlistHelper
      .deleteWishlist(proId, req.session.user._id)
      .then((response) => {
        console.log(response);
        res.json({ status: true });
      });
  },

  userProfile: (req, res) => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(req.session.user._id)

    userHelper.getUserDetails(req.session.user._id).then((user) => {
      console.log(user);
      res.render("user/userProfile", { User: true, user });
    });
  },

  updateuser: (req, res) => {
    console.log("{{{{{{{{{{{{{updateuser}}}}}}}}}}}}}");
    console.log(req.body);
    let userId = req.session.user._id;
    userHelper.updateUserDetatils(userId, req.body).then((response) => {
      console.log(response);
      res.json({ staus: true });
    });
  },

  updateuserPassword: (req, res) => {
    console.log("[[[[[[[[[[[[inn function]]]]]]]]]]]]");
    console.log(req.body)
    userId=req.session.user._id
    userHelper.upadateUserPassword(req.body,userId).then((response) => {
      res.redirect('/userProfile')
    })

  },

  wallet: (req, res) => {
    res.render("user/wallet", { User: true });
  },

  myAddressDetailes: (req, res) => {
    return new Promise(async(resolve, reject) => {
      
      address = await addressHelper.getAllAddress(req.session.user._id)
      res.render('user/myAddress',{User:true,address})
    })
  },

  List: (req, res) => {
    productHelper.getAllproducts().then((products) => {
      
      res.render("user/List", { User: true ,products});
    })
  },


};
