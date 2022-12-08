const collection = require("../config/collection");
var db = require("../config/connection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { reject } = require("promise");
var objectId = require("mongodb").ObjectId;

const ServiceID = process.env.SERVICE_ID;
const AccountSID = process.env.ACCOUNT_SID;
const AuthToken = process.env.AUTH_TOKEN;

module.exports = {
  serviceID: ServiceID,
  accountSID: AccountSID,
  authToken: AuthToken,

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.block = false;
      db.get()
        .collection(collection.USER_COLLECTIION)
        .insertOne(userData)
        .then((data) => {
          console.log(data);
          resolve(data.insertedId);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIION)
        .findOne({ email: userData.email });
      if (user) {
        if (user.block === false) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              console.log("login success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("login failed");
              resolve({ status: false });
            }
          });
        } else {
          console.log("blocke userrrrrrrrrrr");
          resolve({ block: true });
        }
      } else {
        console.log("user not available");
        resolve({ status: false });
      }
    });
  },

  doOtpLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      var response = {};
      console.log("*********userData Helper**********");
      console.log(userData);
      let user = await db
        .get()
        .collection("user")
        .findOne({ mobile: userData });
      console.log(user);
      if (user) {
        console.log("----------otp login successful");
        response.user = user;
        response.acessStatus = true;
        resolve(response);
      } else {
        console.log("otp login failed");
        response.user = "";
        response.acessStatus = false;
        resolve(response);
      }
    });
  },

  getAlluser: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTIION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  getUserDetails: (userId) => {
    console.log("(((((((((((((((((((((((((((((((");
    console.log(userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIION)
        .findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user);
        });
    });
  },

  upadateUserPassword: (userData, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      console.log(userId);
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIION)
        .findOne({ _id: objectId(userId) });
      if (user) {
        bcrypt
          .compare(userData.password, user.password)
          .then(async (status) => {
            console.log(userData.password);
            userData.newpassword = await bcrypt.hash(userData.newpassword, 10);
            if (status) {
              console.log("password corect");
              var data = await db
                .get()
                .collection(collection.USER_COLLECTIION)
                .updateOne(
                  { _id: objectId(userId) },
                  {
                    $set: { password: userData.newpassword },
                  }
                );
              console.log(data);
              resolve(response);
            } else {
              console.log("passord wrong");
            }
          });
      }
    });
  },

  updateUserDetatils: (userId, userDetails) => {
    console.log("{{{{{{[update]}}}}}}");
    console.log(userId);
    console.log(userDetails);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              name: userDetails.name,
              email: userDetails.email,
              mobile: userDetails.mobile,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });
  },

  blockUser: (userid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIION)
        .updateOne(
          { _id: objectId(userid) },
          {
            $set: { block: true },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  unblockUser: (userid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIION)
        .updateOne(
          { _id: objectId(userid) },
          {
            $set: { block: false },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
};
