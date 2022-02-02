var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
const { ObjectId } = require('mongodb')

module.exports = {
    addProduct:(product, callback) => {
        product.Price = parseInt(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },

    getAllProducts:() => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(prodId) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: objectId(prodId)}).then(() => {
                resolve(prodId)
            })
        })
    },

    getProductDetails:(prodId) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(prodId)}).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct:(prodId, prodDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(prodId)}, {
                $set: {
                    Name: prodDetails.Name,
                    Category: prodDetails.Category,
                    Price: parseInt(prodDetails.Price)
                    }
            }).then((response) => {
                resolve()
            })
        })
    },

    addToCart:(prodId, userId) => {
        return new Promise((resolve, reject) => {
            let userCart = await 
            db.get().collection(collection.CART_COLLECTION).findOne()
        })
    }
}