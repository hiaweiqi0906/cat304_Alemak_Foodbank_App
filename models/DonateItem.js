const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DonateItemSchema = new Schema({
    itemId:{
        type: String,
        default: ''
    },
    donorId:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const DonateItem = new mongoose.model('DonateItem', DonateItemSchema)

module.exports = DonateItem