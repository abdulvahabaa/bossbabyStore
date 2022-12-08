var express = require("express");
var router = express.Router();
const userHelper = require("../helpers/userHelper");
const { verifyUser, notVerifyUser } = require("../middleware/userMiddleware");

const {
  homepage,
  loginPage,
  login,
  signupPage,
  signup,
  logout,
  otploginpage,
  otpverifypage,
  otplogin,
  otpVerify,
  cart,
  addTocart,
  changeProdQuantity,
  productview,
  checkout,
  placeorder,
  orderSuccess,
  orders,
  viewOrderProducts,
  verify_payment, 
  OrderDetails,
  addAddress,
  productCancel,
  paypalPayment,
  paypalSuccess,
  wishlist,
  addToWishlist,
  deleteToCart,
  deleteWishlist,
  productReturn,
  userProfile,
  wallet,
  couponCheck,
  deleteAddress,
  List,
  editAddress,
  updateAddress,
  updateuser,
  onlineSuccess,
  updateuserPassword,
  myAddressDetailes,

} = require("../controllers/userController");


router.get("/", homepage);

router.get("/login", loginPage);

router.post("/login", login);

router.get("/signup", signupPage);

router.post("/signup", signup);

router.get("/logout", logout);

router.get("/otpLogin", otploginpage);

router.post("/otpLogin", otplogin);

router.get("/otpVerify", otpverifypage);

router.post("/otpVerify", otpVerify);

router.get("/cart", verifyUser, cart);

router.get("/addTocart/:id", verifyUser, addTocart);

router.post('/deleteToCart/:id',verifyUser,deleteToCart)

router.post("/change-product-quantity", changeProdQuantity);

router.get("/checkout", verifyUser, checkout);

router.post('/add-address', addAddress)

router.get('/edit/Address/:id', editAddress)

router.post('/updateAddressSubmit/:id',updateAddress)

router.post('/deleteAddress/:id', deleteAddress)

router.post("/place-order", placeorder);

router.get("/orderSuccess", orderSuccess);

router.get("/orders", orders);

router.get('/view-order-products/:id', viewOrderProducts)

router.post('/verify-payment', verify_payment)

router.get('/OrderDetailes/:id', OrderDetails)

router.get('/productCancel/:orderId/:proId', productCancel)

router.get('/productReturn/:orderId/:proId',productReturn )

router.get("/productView/:id", productview);

router.get('/paypal/:id', paypalPayment)

router.get('/onlineSuccess/:id', onlineSuccess)

router.get('/wishlist',verifyUser, wishlist)

router.get('/addToWishlist/:id', verifyUser, addToWishlist)

router.post('/deleteWishlist/:id', verifyUser, deleteWishlist)

router.get('/userProfile', userProfile)

router.post('/updateuser', updateuser)

router.post('/changePassword',updateuserPassword)

router.get('/wallet', wallet)

router.get('/myAddress',myAddressDetailes)

router.post('/couponCheck', couponCheck)

router.get('/list',List)




module.exports = router;
