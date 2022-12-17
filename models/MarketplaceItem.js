const mongoose = require('mongoose')
const Schema = mongoose.Schema
const MarketplaceItemSchema = new Schema({
    itemId:{
        type: String,
        default: ''
    },
    sellerId:{
        type: String,
        default: ''
    },
    itemPrice:{
        type: Double,
        default: 0.0
    }
}, {timestamps: true})

const MarketplaceItem = new mongoose.model('MarketplaceItem', MarketplaceItemSchema)

module.exports = MarketplaceItem