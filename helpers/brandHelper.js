const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addBrand: (brand) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BRAND_COLLECTION)
        .insertOne(brand)
        .then(() => {
          resolve();
        });
    });
  },

  getAllbrand: () => {
    return new Promise(async (resolve, reject) => {
      let brands = await db
        .get()
        .collection(collection.BRAND_COLLECTION)
        .find()
        .toArray();
      resolve(brands);
    });
  },

  deleteBrand: (brandId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BRAND_COLLECTION)
        .deleteOne({ _id: objectId(brandId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getBrandDetailes: (brandId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BRAND_COLLECTION)
        .findOne({ _id: objectId(brandId) })
        .then((brand) => {
          resolve(brand);
        });
    });
  },

  updateBrand: (brandId, brandDetailes) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BRAND_COLLECTION)
        .updateOne(
          { _id: objectId(brandId) },
          {
            $set: {
              brand: brandDetailes.brand,
              discount: brandDetailes.discount,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });
  },
};
