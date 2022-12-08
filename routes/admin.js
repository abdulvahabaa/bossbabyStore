const { TaskRouterGrant } = require("twilio/lib/jwt/AccessToken");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/productHelper");
var adminController = require("../controllers/adminController");

const {
  upload,
  upload3,
  upload2,
}= require('../public/javascripts/multer')

const {
  verifyAdmin,
  notVerifyAdmin,
} = require("../middleware/adminMiddleware");

const {
  home,
  login,
  Login,
  logout,
  addProductPage,
  viewProduct,
  addproduct,
  deleteProduct,
  editProduct,
  EditProduct,
  userList,
  block,
  category,
  Category,
  deleteCategory,
  editCategory,
  EditCategory,
  unblock,
  brand,
  Brand,
  deleteBrand,
  editBrand,
  EditBrand,
  orderlist,
  orderlistDetails,
  productStatus,
  banner,
  addBanner,
  deleteBanner,
  EditBanner,
  salesReport,
  coupon,
  addCoupon,
  deleteCoupon

} = require("../controllers/adminController");


router.get("/", notVerifyAdmin, home);

router.get("/login", verifyAdmin, login);

router.post("/login", Login);

router.get("/logout", logout);

router.get("/addProductPage", addProductPage);

router.get("/viewProduct", viewProduct);

router.post("/addProduct",upload.array("image"), addproduct);

router.get("/deleteProduct/:id", deleteProduct);

router.get("/editProduct/:id", editProduct);

router.post("/editProduct/:id",upload.array("image"), EditProduct);

router.get("/category", category);

router.post("/category", Category);

router.get("/deleteCategory/:id", deleteCategory);

router.get("/editCategory/:id", editCategory);

router.post("/editCategory/:id", EditCategory);

router.get('/brand', brand)

router.post('/brand', Brand)

router.get('/deleteBrand/:id', deleteBrand)

router.get('/editBrand/:id', editBrand)

router.post('/editBrand/:id',EditBrand)

router.get("/userList", userList);

router.get("/block/:id", block);

router.get("/unblock/:id", unblock);

router.get('/orderlist', orderlist)

router.get('/orderlistDetails/:id', orderlistDetails)

router.post('/productStatus', productStatus)

router.get('/banner', banner)

router.post('/addBanner', upload3.array("image"), addBanner)

router.get('/deleteBanner/:id', deleteBanner)

router.post('/editBanner', upload3.array("image"), EditBanner)

router.get('/salesReport', salesReport)

router.get('/coupon', coupon)

router.post('/addCoupon', addCoupon)

router.get('/deleteCoupon/:id',deleteCoupon)

module.exports = router;
