const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ReportSchema = new Schema({
    category:{
        type: String,
        default: ''
    },
    content:{
        type: String,
        default: ''
    },
    detailId:{
        type: String,
        default: ''
    }
}, {timestamps: true})

const Report = new mongoose.model('Report', ReportSchema)

module.exports = Report