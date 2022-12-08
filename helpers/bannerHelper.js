const { ObjectID } = require("bson");
const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
const { OrderDetails } = require("../controllers/userController");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addBanner: (banner) => {
    console.log("=========++++");
    console.log(banner);
    // product.price = parseInt(banner.offer);
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collection.BANNER_COLLLECTION)
        .insertOne(banner);
      resolve(banners);
      // callback(data.insertedId);
    });
    // console.log(product, callback);
  },

  getAllbanners: () => {
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collection.BANNER_COLLLECTION)
        .find()
        .toArray();
      resolve(banners);
    });
  },

  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLLECTION)
        .deleteOne({ _id: objectId(bannerId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getBannerDetails: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLLECTION)
        .findOne({ _id: objectId(bannerId) })
        .then((banner) => {
          resolve(banner);
        });
    });
  },

  UpdateBanner: (bannerId, bannerDetails) => {
 
   
     return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.BANNER_COLLLECTION)
          .updateOne(
            { _id: objectId(bannerId) },
            {
              $set: {
                Bname: bannerDetails.Bname,
                Sname: bannerDetails.Sname,
                offer: bannerDetails.offer,
                img: bannerDetails.img,
              }
            }
        ).then((data) => {
          console.log('rrrrrrrrrrrrrrrrrr');
          resolve(data)
        })
      })
    
  },


};
