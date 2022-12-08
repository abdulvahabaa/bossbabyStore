const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addToWishlist: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      time: new Date().getTime(),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userWishlist) {
        let proExist = userWishlist.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);

        if (proExist != -1) {
       
            resolve()
          
        } else {
          
          db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
            { user: objectId(userId) },
            {
              $push: {
                products:proObj,
              }
            }
          ).then((response) => {
            resolve()
          })
        }
      } else {
        let wishistObj = {
          user: objectId(userId),
          products:[proObj]
        }
        db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishistObj).then((response) => {
          console.log(response);

          resolve()
        })
      }
    });
  },

  getWishlistProducts: (userId) => {
    console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
    return new Promise(async(resolve, reject) => {
      try {
        
        let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
          {
            $match:{user:objectId(userId)},
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
              
            }
          },
          {
            $project: {
              item: 1,
              product: {$arrayElemAt:['$product',0]},
              
            }
          }

        
        ])
          .toArray()
        console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwhere")
        console.log(wishlistItems)
        resolve(wishlistItems)
      } catch (error) {
        console.log(error)
        
      }
    })
  },

  getWishlistCount: (userId) => {
    return new Promise(async(resolve, reject) => {
      try {
        let count = 0
        let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (wishlist) {
          count=wishlist.products.length
        }
        resolve(count)
      } catch (error) {
        console.log(error);
      }
    })
  },

  deleteWishlist: (proId,userId) => {
    console.log('#################');
    console.log(proId)
    console.log(userId)
    return new Promise((resolve, reject) => {
      try {
         db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
          {
            user: objectId(userId)
          },
          {
            $pull: {
              products:{item:objectId(proId)}
            }
          }
        ).then((response) => {
          console.log(response)
          resolve(response)
        })
      } catch(error) {
        console.log(error)
      }
    })
  }


};




