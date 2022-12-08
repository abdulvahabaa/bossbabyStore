const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

const Razorpay = require("razorpay");
const e = require("express");
const { format, resolve } = require("path");
const keyId=process.env.KEY_ID
const keySecret=process.env.KEY_SECRET

var instance = new Razorpay({
  key_id: keyId,
  key_secret:keySecret,
});

module.exports = {
  placeOrder: (order, products, userId) => {
    products.forEach((products) => {
      products.productStatus = "order placed";
    });
    console.log(order);
    return new Promise((resolve, reject) => {
      console.log(
        "order consoled 2222222222222222222222222222222222222222222222222222elow"
      );
      console.log(order);
      console.log(userId);
      let status = order.typeofpayment === "cod" ? "placed" : "pending";
      let orderObj = {
        addressId: objectId(order.addressId),

        userId: objectId(userId),

        typeofpayment: order.typeofpayment,
        products: products,
        status: status,
        actualAmount: parseInt(order.actualAmount),
        totalDiscount: parseInt(order.totalDiscount),
        totalAfterDiscount: parseInt(order.totalAfterDiscount),

        day: new Date().toISOString().slice(0, 10),
        date: new Date(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          resolve(response.insertedId);
        });
    });
  },

  clearCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: objectId(userId) });
      resolve();
    });
  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { userId: objectId(userId) },
          },
          {
            $addFields: {
              Date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            },
          },
        ])
        .toArray();
      console.log("!!!!!!!!!!!!!!!!!!!");
      console.log(orders);

      resolve(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              date: 1,
              status: 1,
              productStatus: "$products.productStatus",
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
              productStatus: 1,
              status: 1,
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(orderItems);
    });
  },

  genarateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("New Order :", order);
          resolve(order);
        }
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "NFm4bW1hnBA5tkLkXyOrS7hV");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        );
      resolve();
    });
  },

  
  getOrderList: (userId) => {
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { userId: objectId(userId) },
          },
          {
            $project: {
              actualAmount: 1,
              totalAfterDiscount:1,
              total: 1,
              addressId: 1,
              typeofpayment: 1,
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ])
        .toArray();

      // console.log(orderItems);
      resolve(orderItems);
    });
  },

  cancelProduct: (proId, orderId) => {
    return new Promise(async (resolve, reject) => {
      let proStatus = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId), "products.item": objectId(proId) },
          {
            $set: { "products.$.productStatus": "Cancelled" },
          }
        );
      console.log(proStatus);
      resolve();
    });
  },

  retunProduct: (proId, orderId) => {
    return new Promise(async (resolve, reject) => {
      let proStatus = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId), "products.item": objectId(proId) },
          {
            $set: { "products.$.productStatus": "Return Initiated" },
          }
        );
      console.log(proStatus);
      resolve();
    });
  },

  getAllOrder: () => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {},
          },
          {
            $project: {
              total: 1,
              addressId: 1,
              typeofpayment: 1,
              date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            },
          },
          {
            $lookup: {
              from: collection.ADDRESS_COLLECTION,
              localField: "addressId",
              foreignField: "_id",
              as: "Orderlist",
            },
          },
          {
            $project: {
              address: { $arrayElemAt: ["$Orderlist", 0] },
              _id: 1,
              typeofpayment: 1,
              total: 1,
              date: 1,
            },
          },
        ])
        .toArray();

      console.log(orderItems);
      // console.log(ordelItems.orderlist[0])
      resolve(orderItems);
    });
  },

  productStatusChannge: (orderId, proId, actions) => {
    return new Promise(async (resolve, reject) => {
      let proStatus = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId), "products.item": objectId(proId) },
          {
            $set: { "products.$.productStatus": actions },
          }
        );
      console.log(proStatus);
      resolve();
    });
  },

  getTotalSaleGraph: () => {
    return new Promise(async (resolve, reject) => {
      let dailySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: { $nin: ["cancelled", "pending"] } },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              total: { $sum: "$totalAfterDiscount" },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $limit: 7,
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();

      let monthlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: { $nin: ["cancelled", "pending"] } },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
              total: { $sum: "$totalAfterDiscount" },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $limit: 7,
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();

      let yearlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: { $nin: ["cancelled", "pending"] } },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$date" } },

              total: { $sum: "$totalAfterDiscount" },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $limit: 7,
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();
      console.log(dailySales, monthlySales, yearlySales);
      resolve({ dailySales, monthlySales, yearlySales });
    });
  },

  getPaymentGraph: () => {
    return new Promise(async (resolve, reject) => {
      let totalPayments = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({
          status: { $nin: ["cancelled"] },
        });

      let totalCOD = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({
          typeofpayment: "cod",
          status: { $nin: ["cancelled", "pending"] },
        });

      let totalUPI = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({
          typeofpayment: "razorpay",
          status: { $nin: ["cancelled", "pending"] },
        });

      let totalPaypal = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({
          typeofpayment: "paypal",
          status: { $nin: ["cancelled", "pending"] },
        });

      let percentageCOD = Math.round((totalCOD / totalPayments) * 100);
      let percentageUPI = Math.round((totalUPI / totalPayments) * 100);
      let percentagePaypal = Math.round((totalPaypal / totalPayments) * 100);

      console.log(totalPayments, totalCOD, totalUPI, totalPaypal);
      resolve({ percentageCOD, percentageUPI, percentagePaypal });
    });
  },

  getSalesReport: () => {
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    return new Promise(async (resolve, reject) => {
      let weeklyReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find(
          {
          date: {
            $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
          },
          
          },
          
          
      )
        .toArray();

      let monthlyReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({
          $expr: { $eq: [{ $month: "$date" }, month] },
        })
        .toArray();

      let yearlyReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({
          $expr: { $eq: [{ $year: "$date" }, year] },
        })
        .toArray();
    





  
      resolve({ weeklyReport, monthlyReport, yearlyReport });
    });
  },

  getOrderProductQuantity: (orderId) => {
    console.log("&&&&&&&&&&&&&&&&&&&&&&");
    console.log(orderId);

    return new Promise(async (resolve, reject) => {
      let OrderProdctQunatity = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { _id: objectId(orderId) } },
          {
            $unwind: "$products",
          },
          {
            $project: {
              productId: "$products.item",
              quantity: "$products.quantity",
            },
          },
        ])
        .toArray()
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  
};
