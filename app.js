if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const User = require('./models/User.js')


const users=[]
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
const initializePassport = require('./config/passport-config')
initializePassport(
    passport)


app.set('view-engine', 'ejs')

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

const db = process.env.MONGO_URI
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
  .then((result) => {
    console.log("successfully connected to db");
  })
  .catch((err) => console.log(err))

app.use("/donor/donation", require("./routes/donation"))
app.use("/donor/order", require("./routes/order"))
app.use("/donor/item", require("./routes/item"))
app.use("/donor", require("./routes/donor"))

app.use("/recipient", require("./routes/recipient"))
app.use("/marketplace", require("./routes/marketplace"))

app.get('/', checkNotAuth, (req, res) =>{
    res.render('index.ejs')
})

function checkNotAuth(req, res, next){
  if(!req.isAuthenticated()){
    return next()
  }
  res.redirect('/donor/dashboard')
} 

app.listen(3000)