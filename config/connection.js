const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}

module.exports.connect = (done) => {
    const url = 'mongodb://localhost:27017'
    const dbName = 'shopping'
    // mongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, data) => {
    mongoClient.connect(url,(err, data) => {
    if(err)
        return done(err)
    state.db = data.db(dbName)
    done()
    })
}

module.exports.get = () => {
    return state.db
}