const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DonationSchema = new Schema({
    items:{
        type: Array
    },
    amountAvailable:{
        type: Number,
        default: 0
    },
    recipients:{
        type: Array
    },
    donationDate:{
        type: Date
    },
    donorIC:{
        type: String,
        default: ''
    },
    donorName:{
        type: String,
        default: ''
    }, 
    donorAvatarUri:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const Donation = new mongoose.model('Donation', DonationSchema)

module.exports = Donation