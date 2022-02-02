var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          db.get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: objectId(data.insertedId) })
            .then((user) => {
              resolve(user);
            });
        });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });

      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ response: false });
      }
    });
  },

  addToCart: (prodId, userId) => {
    let prodObj = {
      item: objectId(prodId),
      quantity: 1
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let prodExist = userCart.products.findIndex(
          (product) => product.item == prodId
        );
        if (prodExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(prodId) },
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
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [prodObj],
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

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
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
              $project: {
                  item: 1, quantity: 1, product: {$arrayElemAt: ['$product', 0]}
              }
          }
        ])
        .toArray();
      resolve(cartItems);
    });
  },

  getItemsCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let itemCount = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        itemCount = cart.products.length;
      }
      resolve(itemCount);
    });
  },

  updateQuantity: (data) => {
    data.quantity = parseInt(data.quantity)
    return new Promise((resolve, reject) => {
        if(data.quantity == 1 && data.itemCount == -1)
        {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id: objectId(data.cart)},
            {
                $pull:{products: {item: objectId(data.product)}}
            }
            )
            .then((response) => {
                    resolve({removeProduct: true})
            })
        }else{
            db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                { _id: objectId(data.cart), "products.item": objectId(data.product) },
                {
                    $inc: { "products.$.quantity": data.itemCount}
                }
                )
                .then((response) => {
                resolve({status: true});
                });
        }
        if (data.itemCount == 0){
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id: objectId(data.cart)},
            {
                $pull:{products: {item: objectId(data.product)}}
            }
            )
            .then((response) => {
                resolve({emptyCart: true})
            })
        }            
    })
  },

  getTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
        let total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId (userId) }
            },
            {
              $unwind: "$products"
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity"
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product"
              },
            },
            {
                $project: {
                    item: 1, quantity: 1, product: {$arrayElemAt: ['$product', 0]}
                }
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: {$multiply: ['$quantity', '$product.Price']}}
                }
            }
          ])
          .toArray()
          
          if(total.length == 0)
          {
            let total = 0
            resolve(total)
          }else{
            resolve(total[0].total)
          }
      });
  }
};
