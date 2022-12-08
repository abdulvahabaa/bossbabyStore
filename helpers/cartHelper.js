const e = require("express");
const { response } = require("../app");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
      time: new Date().getTime(),
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);

        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  deleteToCart: (proId, userId) => {
    console.log("@@@@@@@@@@@@@@@@@@@@@");
    console.log(proId);
    console.log(userId);
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              user: objectId(userId),
            },
            {
              $pull: {
                products: { item: objectId(proId) },
              },
            }
          )
          .then((response) => {
            console.log(response);
            resolve(response);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },

  getCartProducts: (userId) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },

            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },

            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $unwind: "$product",
            },
            {
              $lookup: {
                from: "category",
                localField: "product.category",
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
                    if: {
                      $gt: ["$product.discount", "$categoryDetails.discount"],
                    },
                    then: { $toInt: "$product.discount" },
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
                          { $toInt: "$product.price" },
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
                      { $toInt: "$product.price" },
                      { $toInt: "$discountedAmount" },
                    ],
                  },
                },
              },
            },
            {
              $addFields: {
                singleTotal: {
                  $multiply: [
                    { $toInt: "$priceAfterDiscount" },
                    { $toInt: "$quantity" },
                  ],
                },
              },
            },
          ])
          .toArray();
        console.log("///////////////////////////////hrere");
        console.log(cartItems);

        resolve(cartItems);
      } catch (error) {
        console.log(error);
      }
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (cart) {
          count = cart.products.length;
        }
        resolve(count);
      } catch (error) {
        console.log(error);
      }
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    console.log("%%&&&&&&&&&&&&^^^^^^^^^^^****");
    // console.log(details.cart,details.product);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: objectId(details.userId) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toInt: "$quantity" },
                      { $toInt: "$product.price" },
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
        console.log("///////////////////////////////hrere");

        if (total != null) {
          console.log(total[0].total);
          resolve(total[0].total);
        }
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },

  getTotalDiscountedAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .find()
        .toArray();
      if (cart) {
        let totalDiscountedAmount = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "product",
                localField: "item",
                foreignField: "_id",
                as: "products",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$products", 0] },
              },
            },
            {
              $lookup: {
                from: "category",
                localField: "product.category",
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
                    if: {
                      $gt: ["$product.discount", "$categoryDetails.discount"],
                    },
                    then: { $toInt: "$product.discount" },
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
                          { $toInt: "$product.price" },
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
              $group: {
                _id: null,
                totalDiscount: {
                  $sum: {
                    $multiply: ["$quantity", { $toInt: "$discountedAmount" }],
                  },
                },
              },
            },
          ])
          .toArray();
        console.log("*********totalDiscountedAmount");
        console.log(totalDiscountedAmount);
        console.log("*********totalDiscountedAmount");
        resolve(totalDiscountedAmount[0].totalDiscount);
        console.log(totalDiscountedAmount[0].totalDiscount);
      } else {
        resolve(cart);
      }
      // console.log(cart);
    });
  },

  getTotalPriceAfterDiscount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .find()
        .toArray();
      if (cart) {
        let totalAmount = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "product",
                localField: "item",
                foreignField: "_id",
                as: "products",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$products", 0] },
              },
            },
            {
              $lookup: {
                from: "category",
                localField: "product.category",
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
                    if: {
                      $gt: ["$product.discount", "$categoryDetails.discount"],
                    },
                    then: { $toInt: "$product.discount" },
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
                          { $toInt: "$product.price" },
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
                      { $toInt: "$product.price" },
                      { $toInt: "$discountedAmount" },
                    ],
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$quantity", { $toInt: "$priceAfterDiscount" }],
                  },
                },
              },
            },
          ])
          .toArray();
        console.log("*********total-amount");
        console.log(totalAmount);
        console.log("*********total-amount");
        resolve(totalAmount[0].total);
        console.log(totalAmount[0].total);
      } else {
        resolve(cart);
      }
      // console.log(cart);
    });
  },

  getCartProductList: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      console.log("dadadasddsffdfdgdgfgfgdfgfdg");
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log(cart);
      resolve(cart.products);
    });
  },
};
