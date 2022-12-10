const { router, response } = require("../app");
const productHelpers = require("../helpers/productHelper");
var productHelper = require("../helpers/productHelper");

var userHelper = require("../helpers/userHelper");
const categoryHelper = require("../helpers/categoryHelper");
const brandHelper = require("../helpers/brandHelper");
const orderHelper = require("../helpers/orderHelper");
const addressHelper = require("../helpers/addressHelper");
const bannerHelper = require("../helpers/bannerHelper");
const couponHelper = require("../helpers/couponHelper");
const { log } = require("handlebars");
const { Db } = require("mongodb");
const collection = require("../config/collection");

// var Admin = {
 
// };

const adminDM = process.env.EMAIL
const passwordDM=process.env.PASSWORD

module.exports = {
  home: async (req, res, next) => {
    try {
      let response = await orderHelper.getTotalSaleGraph();
      let { dailySales, monthlySales, yearlySales } = response;

      let paymentsReport = await orderHelper.getPaymentGraph();
      let { percentageCOD, percentageUPI, percentagePaypal } = paymentsReport;
      res.render("admin/home", {
        adminDM,
        dailySales,
        monthlySales,
        yearlySales,
        percentageCOD,
        percentageUPI,
        percentagePaypal,
      });
    } catch (error) {
      console.log(error);
    }

    // res.render("admin/home", { Admin });
  },

  login: (req, res, next) => {
    if (req.session.AdminloggedInErr) {
      res.render("admin/login", {
        AdminloggedInErr: req.session.AdminloggedInErr,
      });
      return (req.session.AdminloggedInErr = false);
    }
    res.render("admin/login");
  },

  viewProduct: (req, res, next) => {
    productHelper.getAllproducts().then(async (products) => {
      let brands = await brandHelper.getAllbrand();
      let categories = await categoryHelper.getAllcategory();
      res.render("admin/viewProduct", { products, categories, brands });
    });
  },

  Login: (req, res) => {
    console.log(req.body);

    if (
      req.body.email === adminDM
      &&
      req.body.password === passwordDM
    ) {
      console.log(req.session);
      req.session.Admin = req.body;
      req.session.Adminloggedin = true;
      // console.log(req.session);
      res.redirect("/admin");
    } else {
      console.log(req.body);
      req.session.AdminloggedInErr = "invalid user or password";
      res.redirect("/admin/login");
    }
  },

  logout: (req, res) => {
    console.log(req.session);
    req.session.Admin = null;
    req.session.Adminloggedin = false;
    // req.session.destroy()
    res.redirect("/admin/login");
    console.log(req.session);
  },

  addProductPage: (req, res, next) => {
    productHelper.getAllproducts().then(async (products) => {
      let brands = await brandHelper.getAllbrand();
      let categories = await categoryHelper.getAllcategory();
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
      console.log(categories);
      res.render("admin/addProduct", { products, categories, brands });
    });
  },

  addproduct: (req, res, next) => {
    console.log("&&&&&&&&&&&&&&&&&&&&&");
    console.log(req.body);
    console.log(req.files);
    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const product = req.body;
    product.img = fileName;
    productHelper.addproduct(req.body).then(() => {
      res.redirect("/admin/addProductPage");
    });
  },

  deleteProduct: (req, res) => {
    let proId = req.params.id;
    console.log(proId);
    productHelper.DeleteProduct(proId).then((response) => {
      res.redirect("/admin/viewProduct");
    });
  },

  editProduct: async (req, res) => {
    let brands = await brandHelper.getAllbrand();
    let categories = await categoryHelper.getAllcategory();
    let product = await productHelper.getProductDetails(req.params.id);
    console.log(product);
    res.render("admin/editProduct", { product, categories, brands });
  },

  EditProduct: async (req, res) => {
    let id = req.params.id;
    console.log(req.body);
    console.log(req.files);

    let oldProductDetails = await productHelpers.getProductDetails(
      req.params.id
    );
    const file = req.files;
    let filename;
    req.body.img =
      req.files.length != 0
        ? (filename = file.map((file) => {
            return file.filename;
          }))
        : oldProductDetails.img;

    productHelper.updateProduct(id, req.body).then(() => {
      res.redirect("/admin/viewProduct");
    });
  },

  category: (req, res) => {
    categoryHelper.getAllcategory().then((categories) => {
      res.render("admin/category", { categories });
    });
  },

  Category: (req, res) => {
    console.log("////////////////////////");
    console.log(req.body);
    categoryHelper.addCatogery(req.body).then(() => {
      res.redirect("/admin/category");
    });
  },

  deleteCategory: (req, res) => {
    let catId = req.params.id;
    console.log(catId);
    categoryHelper.deleteCategory(catId).then((response) => {
      res.redirect("/admin/category");
    });
  },

  editCategory: async (req, res) => {
    console.log("&&&&&&&&&&&&&&&&&");
    let category = await categoryHelper.getCategoryDetatiles(req.params.id);
    let cat = await categoryHelper.getAllcategory();
    console.log(category);
    res.render("admin/editCategory", { category, cat });
  },

  EditCategory: (req, res) => {
    let id = req.params.id;
    categoryHelper.updateCategory(req.params.id, req.body).then(() => {
      res.redirect("/admin/category");
    });
  },

  userList: (req, res) => {
    userHelper.getAlluser().then((users) => {
      res.render("admin/userList", { users });
    });
  },

  block: (req, res, next) => {
    let id = req.params.id;
    console.log(id);
    userHelper.blockUser(id).then((result) => {
      res.redirect("/admin/userList");
    });
  },

  unblock: (req, res) => {
    let id = req.params.id;
    console.log(id);
    userHelper.unblockUser(id).then((result) => {
      res.redirect("/admin/userList");
    });
  },

  brand: (req, res) => {
    brandHelper.getAllbrand().then((brands) => {
      res.render("admin/brand", { brands });
    });
  },

  Brand: (req, res) => {
    console.log(req.body);
    brandHelper.addBrand(req.body).then(() => {
      res.redirect("/admin/brand");
    });
  },

  deleteBrand: (req, res) => {
    let brandId = req.params.id;
    console.log(brandId);
    brandHelper.deleteBrand(brandId).then((response) => {
      res.redirect("/admin/brand");
    });
  },

  editBrand: async (req, res) => {
    console.log(req.body);
    let brand = await brandHelper.getBrandDetailes(req.params.id);
    let brnd = await brandHelper.getAllbrand();
    console.log(brand);
    res.render("admin/editBrand", { brand, brnd });
  },

  EditBrand: (req, res) => {
    let id = req.params.id;
    brandHelper.updateBrand(req.params.id, req.body).then(() => {
      res.redirect("/admin/brand");
    });
  },

  orderlist: async (req, res) => {
    let orders = await orderHelper.getAllOrder();
    console.log("[[[[[[ZZZZZ]]]]]]");
    console.log(orders);
    res.render("admin/orderlist", { orders });
  },

  orderlistDetails: async (req, res) => {
    let orderId = req.params.id;
    let products = await orderHelper.getOrderProducts(orderId);
    console.log("tes-----------", products);

    res.render("admin/orderlistDetails", { products });
  },

  productStatus: async (req, res) => {
    orderHelper
      .productStatusChannge(req.body.orderId, req.body.item, req.body.action)
      .then(() => {
        res.json({ status: true });
      });
  },

  banner: (req, res) => {
    bannerHelper.getAllbanners().then(async (banners) => {
      console.log("*********+++++++*******");
      console.log(banners);
      res.render("admin/banner", { banners });
    });
  },

  addBanner: (req, res) => {
    console.log("&&&&&&&-----------------&&&&&&&&&&&&&&");
    console.log(req.body);
    console.log(req.files);
    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const banner = req.body;
    banner.img = fileName;

    bannerHelper.addBanner(req.body).then(() => {
      res.redirect("/admin/banner");
    });
  },

  deleteBanner: (req, res) => {
    let bannerId = req.params.id;
    console.log(bannerId);
    bannerHelper.deleteBanner(bannerId).then((response) => {
      res.redirect("/admin/banner");
    });
  },

  EditBanner: async (req, res) => {
    console.log("########################");
    console.log(req.body);
    console.log(req.files);
    console.log(req.body.bannerId);

    let oldBannerDetails = await bannerHelper.getBannerDetails(
      req.body.bannerId
    );
    console.log(oldBannerDetails);

    const file = req.files;
    let filename;
    req.body.img =
      req.files != 0
        ? (filename = file.map((file) => {
            return file.filename;
          }))
        : oldBannerDetails.img;
    bannerHelper.UpdateBanner(req.body.bannerId, req.body).then((response) => {
      console.log("responseeeeeeeeeeeeeeeeeeeeeeeeee");
      // res.json(response)
      res.redirect("/admin/banner");
    });
  },

  salesReport: async (req, res) => {
    let salesReport = await orderHelper.getSalesReport();
    console.log("*************salesReport*********");
    console.log(salesReport);
    let { weeklyReport, monthlyReport, yearlyReport } = salesReport;
    console.log(weeklyReport);

    res.render("admin/salesReport", {
      weeklyReport,
      monthlyReport,
      yearlyReport,
    });
  },

  coupon: (req, res) => {
    console.log("hiiiiiiiiiiioiiiiiioo");
    couponHelper.getAllCoupon().then((coupons) => {
      console.log(coupons);
      res.render("admin/coupon", { coupons });
    });
  },

  addCoupon: (req, res) => {
    couponHelper.addCoupon(req.body).then(() => {
      res.redirect("/admin/coupon");
    });
  },

  deleteCoupon: (req, res) => {
    let couponId = req.params.id;

    couponHelper.deleteCoupon(couponId).then((response) => {
      res.redirect("/admin/coupon");
    });
  },
};
