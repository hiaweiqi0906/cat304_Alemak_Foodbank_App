const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ItemSchema = new Schema({
    itemName:{
        type: String,
        default: ''
    },
    itemExpiryDate:{
        type: Date,
    },
    sellerIC:{
        type: String,
        default: ''
    },
    itemPrice:{
        type: Double,
        default: 0.0
    }
}, {timestamps: true})

const Item = new mongoose.model('Item', ItemSchema)

module.exports = Item