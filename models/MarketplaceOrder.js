const mongoose = require('mongoose')
const Schema = mongoose.Schema
const MarketplaceOrderSchema = new Schema({
    buyerId:{
        type: String,
        default: ''
    },
    marketplaceItemId:{
        type: String,
        default: ''
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

const MarketplaceOrder = new mongoose.model('MarketplaceOrder', MarketplaceOrderSchema)

module.exports = MarketplaceOrder