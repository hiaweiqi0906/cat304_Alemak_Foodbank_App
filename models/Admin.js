const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AdminSchema = new Schema({
    password:{
        type: String,
        default: ''
    },
    adminId:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const Admin = new mongoose.model('Admin', AdminSchema)

module.exports = Admin