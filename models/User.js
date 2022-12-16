const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    noIC:{
        type: String,
        default: ''
    }, 
    firstName:{
        type: String,
        default: ''
    }, 
    lastName:{
        type: String,
        default: ''
    }, 
    email:{
        type: String,
        default: ''
    }, 
    documentId:{
        type: String,
        default: ''
    }, 
    addressId:{
        type: String,
        default: ''
    }, 
    avatarUri:{
        type: String,
        default: ''
    },
    cloudinaryId:{
        type:String,
        default: ''
    },
    gender:{
        type:String,
        default: ''
    },
    telephoneNumber:{
        type:String,
        default: ''
    },
    donorActivated:{
        type:String,
        default: false
    },
    RecipientActivated:{
        type:String,
        default: false
    }
}, {timestamps: true})

const User = new mongoose.model('User', UserSchema)

module.exports = User