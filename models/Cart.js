const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CartSchema = new Schema({
    userIC:{
        type: String,
        default: ''
    },
    items:{
        type: Array
    }
}, {timestamps: true})

const Cart = new mongoose.model('Cart', CartSchema)

module.exports = Cart