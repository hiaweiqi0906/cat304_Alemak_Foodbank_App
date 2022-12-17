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

const initializePassport = require('./config/passport-config')
initializePassport(
    passport)


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
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

app.get('/', checkAuth, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuth, (req, res)=>{
    res.render('login.ejs')
})

app.get('/register', checkNotAuth, (req, res)=>{
    
    res.render('register.ejs')
})

app.post('/register', async (req, res)=>{
    try{
        User.findOne({
            email: req.body.email
        })
            .then((user) => {
                if (!user) {
                    const newUser = new User({
                        firstName: req.body.firstName, 
                        lastName: req.body.lastName, 
                        email: req.body.email, 
                        password: req.body.password,
                        telNumber:  req.body.noTel,
                        gender:  req.body.gender,
                        noIC:  req.body.noic
                    })
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) throw err
    
                        bcrypt.hash(req.body.password, salt, function (err, hash) {
                            if (err) throw err
    
                            newUser.password = hash
                            newUser.save()
                                .then((users) => {
                                    console.log('registered')
                                    res.redirect('/login')
                                })
                                .catch(err => console.log(err))
                        });
                    });
                } else {
                    console.log('user exist')
                    res.redirect('/register')
                }
            })
            .catch(err => console.log(err))
        // const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // users.push({
        //     id: Date.now().toString(),
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword
        // })
        // res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,

}))

app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  })

function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuth(req, res, next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}
app.listen(3000)