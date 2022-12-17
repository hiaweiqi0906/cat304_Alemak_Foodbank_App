const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DonationRecordSchema = new Schema({
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

const DonationRecord = new mongoose.model('DonationRecord', DonationRecordSchema)

module.exports = DonationRecord