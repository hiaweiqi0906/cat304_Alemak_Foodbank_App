const mongoose = require('mongoose')
const Schema = mongoose.Schema
const OrderSchema = new Schema({
    buyerIC:{
        type: String,
        default: ''
    },
    buyerName:{
        type: String,
        default: ''
    },
    sellerIC: {
        type: String,
        default: ''
    }, 
    sellerName: {
        type: String,
        default: ''
    }, 
    sellerAddress: {
        type: String,
        default: ''
    }, 
    buyerAddress: {
        type: String,
        default: ''
    }, 
    marketplaceItems:{
        type: Array
    },
    deliveryStatus:{
        type: String,
        default: ''
    },
    orderDate:{
        type: Date,
    },
    paymentDate:{
        type: Date,
    }
}, {timestamps: true})

const Order = new mongoose.model('Order', OrderSchema)

module.exports = Order