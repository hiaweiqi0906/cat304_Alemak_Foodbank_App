const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema({
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
    password:{
        type: String,
        default: ''
    },
    email:{
        type: String,
        default: ''
    }, 
    payslipUri:{
        type: String,
        default: ''
    }, 
    payslipCloudId:{
        type: String,
        default: ''
    }, 
    ICFrontUri:{
        type: String,
        default: ''
    }, 
    ICFrontCloudId:{
        type: String,
        default: ''
    }, 
    ICBackUri:{
        type: String,
        default: ''
    }, 
    ICBackCloudId:{
        type: String,
        default: ''
    }, 
    address:{
        type: String,
        default: ''
    },
    state:{
        type: String,
        default: ''
    },
    location:{
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
    telNumber:{
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