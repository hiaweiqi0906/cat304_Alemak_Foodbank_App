const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ItemSchema = new Schema({
    coverUri:{
        type: String,
        default: ''
    }, 
    coverCloudinaryId:{
        type: String,
        default: ''
    }, 
    itemUri:{
        type: Array
    },
    itemCloudinaryId:{
        type: Array
    },
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
    sellerAddress:{
        type: String,
        default: ''
    },
    itemDescription:{
        type: String,
        default: ''
    },
    itemPrice:{
        type: Number,
        default: 0.0
    },
    sellerName:{
        type: String,
        default: ''
    }, 
    sellerAvatarUri:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const Item = new mongoose.model('Item', ItemSchema)

module.exports = Item