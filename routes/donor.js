if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const upload = require('../utils/multer')
const cloudinary = require("../utils/cloudinary");
const User = require('../models/User.js')



router.get('/', checkNotAuth, (req, res) => {
    res.render('donor/donorIndex.ejs')
})

router.get('/dashboard', checkAuth, (req, res) => {
    res.render('donor/donorDashboard.ejs', { name: req.user.name })
})

router.get('/items', checkAuth, (req, res) => {
    //
})

router.get('/login', checkNotAuth, (req, res) => {
    res.render('donor/login.ejs')
})

router.get('/register', checkNotAuth, (req, res) => {

    res.render('donor/register.ejs')
})

router.get('/setting', checkAuth, (req, res) => {
    res.render('donor/donorSetting.ejs', { user: req.user, messages: {} })
})

router.post('/setting', upload.single("coverImg"), async (req, res) => {
    var newUser = {}
    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
        newUser.avatarUri = result?.secure_url || ''
        newUser.cloudinaryId = result?.public_id || ''
    }
    newUser.firstName = req.body.firstName
    newUser.lastName = req.body.lastName
    newUser.address = req.body.address
    newUser.state = req.body.state
    newUser.location = req.body.location
    newUser.gender = req.body.gender
    newUser.telNumber = req.body.telNumber

    User.findByIdAndUpdate(req.user._id, newUser, { new: true }, function (err, doc) {
        if (err) console.log(err)
        else {
            console.log('updated')
            res.render('donor/donorSetting.ejs', { user: doc, messages: {} })
        }
    })


})

router.post('/changePassword', (req, res) => {
    const newPassword1 = req.body.newPassword1
    const newPassword2 = req.body.newPassword2
    const oldPassword = req.body.password
    const user = req.user

    if (newPassword1 !== newPassword2) {

    } else {
        bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) throw err

                    bcrypt.hash(newPassword1, salt, function (err, hash) {
                        if (err) throw err

                        User.findByIdAndUpdate(req.user._id, { password: hash }, function (err, doc) {
                            if (err) console.log(err)
                            else {
                                res.redirect('/donor/setting')
                            }
                        })
                    });
                });
            } else {
                res.render('donor/donorSetting.ejs', { user: req.user, messages: {error: ['password mismatched']} })
            }
        });

    }
})

router.post('/register', async (req, res) => {
    try {
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
                        telNumber: req.body.noTel,
                        gender: req.body.gender,
                        noIC: req.body.noic
                    })
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) throw err

                        bcrypt.hash(req.body.password, salt, function (err, hash) {
                            if (err) throw err

                            newUser.password = hash
                            newUser.save()
                                .then((users) => {
                                    res.redirect('/donor/login')
                                })
                                .catch(err => console.log(err))
                        });
                    });
                } else {
                    res.render('donor/register.ejs', { messages: { error: "user existed" } })
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
    } catch {
        res.redirect('/donor/register')
    }
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/donor/dashboard',
    failureRedirect: '/donor/login',
    failureFlash: true,
}))

router.delete('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/donor');
    });
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/donor/login')
}

function checkNotAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/donor/dashboard')
}

module.exports = router