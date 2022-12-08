const { CurrentCallPage } = require("twilio/lib/rest/preview/trusted_comms/currentCall");
const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addCoupon: (coupon) => {
    console.log("@@@@@@@@@@@@@coupon@@@@@@@@@@@@@@@@@");
    console.log(coupon);
    coupon.expairyDate= new Date(coupon.expairyDate)
    coupon.maxAmount = parseInt(coupon.maxAmount);
    coupon.minAmount = parseInt(coupon.minAmount);
    coupon.discount = parseInt(coupon.discount);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .insertOne(coupon)
        .then(() => {
          resolve();
        });
    });
  },

  getAllCoupon: () => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    return new Promise(async (resolve, reject) => {
      let coupons = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(coupons);
    });
  },

  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: objectId(couponId) })
        .then((coupon) => {
          resolve(coupon);
        });
    });
  },

  checkCouponCode: (couponcode, userId, total) => {
    let response={}
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ couponCode: couponcode }).then((response) => {
          console.log(response);
          if (new Date() <= response.expairyDate) {
            let discountAmount = (total * parseInt(response.discount)) / 100
            let dicountedTotalPrice = total - discountAmount
            dicountedTotalPrice=  Math.round(dicountedTotalPrice)
            discountAmount=  Math.round(discountAmount)
            console.log(discountAmount)
            console.log(dicountedTotalPrice)
            
            response.discountAmount = discountAmount
            response.dicountedTotalPrice = dicountedTotalPrice
            
            console.log('Coupon valid');

            console.log('[[[[[]]]]]');
            console.log(response._id);
            
            resolve(response)
          } else {
            reject({message:'Coupon Expired'})
         }
        })
        
        
    });
  },
};
