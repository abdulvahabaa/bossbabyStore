const { ObjectID } = require("bson");
const { CompositionHookPage } = require("twilio/lib/rest/video/v1/compositionHook");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  
  addAddress: (address, userId) => {
    let response={}
    return new Promise((resolve, reject) => {
      let addressObj = {
        
        userId: objectId(userId),
        fname: address.fname,
        lname: address.lname,
        country: address.country,
        address: address.address,
        town: address.town,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        email: address.email,
       
        
      }




      db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then((data) => {
        resolve(data)
        console.log(data)
      })
    })
  },

  getAllAddress: (userId) => {
    return new Promise(async(resolve, reject) => {
      let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
      resolve(address)
    })
  },

  getAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      console.log(addressId);
      
      let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id: objectId(addressId) })
      console.log(address);
      resolve(address)
    })
  },

  deleteAddress: (userId, addressId) => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&');
    console.log(userId);
    console.log(addressId);
    return new Promise((resolve, reject) => {
      
        db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(addressId) }).then((response) => {
          resolve(response)
        })
      
    })
  },

  updateAddress: ( addressId,addressDeatails,userId) => {
    console.log('&&&&&&&&&&&&&&&&');
    console.log(userId);
    console.log(addressId);
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).updateOne(
        { _id: objectId(addressId) },
        {
          $set: {
            userId: objectId(userId),
            fname: addressDeatails.fname,
            lname: addressDeatails.lname,
            country: addressDeatails.country,
            address: addressDeatails.address,
            town: addressDeatails.town,
            state: addressDeatails.state,
            pincode: addressDeatails.pincode,
            phone: addressDeatails.phone,
            email: addressDeatails.email,
          }
        }
      
      ).then((data) => {
        
        console.log('((((((((((((((((((((');
        resolve(data)
      })
    })
  }

 
}