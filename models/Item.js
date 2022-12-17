const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ItemSchema = new Schema({
    itemUri:{
        type: Array
    },
    itemCloudId:{
        type: Array
    },
    itemTitle:{
        type: String,
        default: ''
    },
    itemExpiryDate:{
        type: Date,
    }
}, {timestamps: true})

const Item = new mongoose.model('Item', ItemSchema)

module.exports = Item