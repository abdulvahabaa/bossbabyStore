const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {

  
  addCatogery: (category) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .insertOne(category)
        .then(() => {
          resolve();
        });
    });
  },

  getAllcategory: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(categories);
    });
  },

  deleteCategory: (catId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
        console.log(response);
        resolve(response);
      })
    })
  },

  getCategoryDetatiles: (catId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) }).then((catogery) => {
        resolve(catogery)
      })
    })
  },

  updateCategory: (catId, catDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectId(catId) },
          {
            $set: {
              category: catDetails.category,
              discount:catDetails.discount,
             
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });


  }
}