const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ResolveSchema = new Schema({
    reportId:{
        type: String,
        default: ''
    },
    adminId:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const Resolve = new mongoose.model('Resolve', ResolveSchema)

module.exports = Resolve