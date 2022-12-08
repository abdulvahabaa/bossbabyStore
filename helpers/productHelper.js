const {
  CompositionHookPage,
} = require("twilio/lib/rest/video/v1/compositionHook");
const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addproduct: (product) => {
    console.log("=========++++");
    console.log(product.price);
    product.price = parseInt(product.price);
    product.discount = parseInt(product.discount);
    product.stock = parseInt(product.stock);
    product.category = objectId(product.category);
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(product);
      resolve(products);
      // callback(data.insertedId);
    });
    // console.log(product, callback);
  },

  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $lookup: {
                from: "category",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails",
              },
            },
            {
              $unwind: "$categoryDetails",
            },

            {
              $addFields: {
              
                discountOff: {
                  $cond: {
                    if: { $gt: ["$discount", "$categoryDetails.discount"] },
                    then: { $toInt: "$discount" },
                    else: { $toInt: "$categoryDetails.discount" },
                  },
                },
              },
            },
            {
              $addFields: {
                discountedAmount: {
                  $round: {
                    $divide: [
                      {
                        $multiply: [
                          { $toInt: "$price" },
                          { $toInt: "$discountOff" },
                        ],
                      },
                      100,
                    ],
                  },
                },
              },
            },
            {
              $addFields: {
                priceAfterDiscount: {
                  $round: {
                    $subtract: [
                      { $toInt: "$price" },
                      { $toInt: "$discountedAmount" },
                    ],
                  },
                },
              },
            },
            {
              $sort: { _id: -1 },
            },
          ])
          .toArray();
        console.log(product);
        resolve(product);
      } catch (error) {
        console.log(error);
      }
    });
  },

  DeleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(proId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(proId) },
          {
            $set: {
              name: proDetails.name,
              description: proDetails.description,

              price: parseInt(proDetails.price),
              category: objectId(proDetails.category),
              img: proDetails.img,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });
  },

  filterBrandProduct: (filterItems) => {
    console.log("................................");
    console.log(filterItems);
    console.log("................................");

    return new Promise(async (resolve, reject) => {
      if (Array.isArray(filterItems)) {
        filterItems.forEach(convert);
        function convert(item, index, arr) {
          arr[index] = objectId(item);
        }
        console.log("-=-=-=-=-=-=-=-=-=-=-=-=");
        console.log(filterItems);
        console.log("-=-=-=-=-=-=-=-=-=-=-=-=");

        let filter = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({
            brand: { $in: filterItems },
          })
          .toArray();
        console.log(filter);
        resolve(filter);
      } else {
        // let filterArray = filterItems;
        let filterData = objectId(filterItems);
        console.log("==========================");
        console.log(filterData);
        console.log("==========================");

        let filter = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({
            brand: { $in: [filterData] },
          })
          .toArray();
        console.log(filter);
        resolve(filter);
      }
    });
  },

  updateStockDecrease: ({ productId, quantity }) => {
    console.log(productId);

    return new Promise(async (resolve, reject) => {
      console.log("into decrese");
      console.log(quantity);
      quantity = parseInt(quantity);

      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $inc: { stock: -quantity },
          }
        );
    });
  },

  updateStockIncrease: ({ productId, quantity }) => {
    console.log('{{{{{stock increese}}}}}');
    console.log(quantity);
    console.log(productId);
    
    return new Promise(async(resolve, reject) => {
      console.log("into increse");
      console.log(quantity);
      quantity = parseInt(quantity);
     await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $inc: { stock: +quantity },
          }
      );
    })
    
  },

 
};
