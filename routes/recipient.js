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
const Cart = require('../models/Cart.js')
const Order = require('../models/Order.js')
const Item = require('../models/Item.js')
const Donation = require('../models/Donation.js')



router.get('/', checkNotAuth, (req, res) => {
    res.render('recipient/recipientIndex.ejs')
})

router.get('/order/:id', checkAuth, (req, res) => {
    Order.findById(req.params.id, function (err, docs) {
        if (err) console.log(err)
        else {
            let totalAmount = 0
            docs.marketplaceItems.forEach(item=>{
                totalAmount+=item.itemPrice
            })
            res.render('recipient/recipientOrderDetails.ejs', { order: docs, totalAmount})
        }
    })
})

router.get('/order', checkAuth, (req, res) => {
    Order
        .find({ buyerIC: req.user.noIC })
        .sort({ createdAt: 'desc' })
        .exec(function (err, doc) {
            if (err) console.log(err)
            res.render('recipient/recipientAllOrders.ejs', { order: doc })
        });
})

router.get('/donation/register/:id', checkAuth, (req, res) => {
    Donation.findById(req.params.id, function (err, donation) {
        amountAvailable = donation.amountAvailable

        if (amountAvailable > 0) {
            amountAvailable--
            recipients = donation.recipients
            recipients.push({
                recipientID: req.user._id,
                recipientName: req.user.firstName + ' ' + req.user.lastName,
                recipientAvatar: req.user.avatarUri
            })
            Donation.findByIdAndUpdate(req.params.id, {
                amountAvailable,
                recipients
            }, function(err, doc){
                if(err ) console.log(err)
                else res.redirect('/recipient/donation')
            })
        }
    })
})

router.get('/donation/:id', (req, res) => {
    Donation.findById(req.params.id, function (err, donation) {
        res.render('recipient/recipientDonationDetails.ejs', { donation: donation })
    })
})

router.get('/donation', (req, res) => {
    Donation.find({}, function (err, donations) {
        res.render('recipient/recipientAllDonation.ejs', { donations: donations })
    })
})

router.get('/dashboard', checkAuth, (req, res) => {
    res.render('recipient/recipientDashboard.ejs', { name: req.user.firstName })
})

router.get('/order/place', checkAuth, (req, res) => {
    console.log('here')
    //arrange items to respective sellers
    let sellerICArr = []
    let itemBySeller = [[]]
    Cart.findOne({ userIC: req.user.noIC }, function (err, cart) {
        if (err) console.log(err)
        else {
            cart.items.forEach(item => {
                // console.log(sellerICArr.includes(item.sellerIC))
                // sellerICArr.push(item.sellerIC)
                // console.log(sellerICArr)
                if (!sellerICArr.includes(item.sellerIC)) {
                    sellerICArr.push(item.sellerIC)
                }
                itemBySeller[sellerICArr.indexOf(item.sellerIC)].push(item)
                console.log(itemBySeller)
            });
            for (let i = 0; i < sellerICArr.length; i++) {
                User.findOne({ noIC: sellerICArr[i] }, function (err, user) {
                    console.log(user)
                    const newOrder = new Order({
                        buyerIC: req.user.noIC,
                        buyerName: req.user.firstName + ' ' + req.user.lastName,
                        buyerAddress: req.user.address,
                        sellerAddress: user.address,
                        sellerName: user.firstName + ' ' + user.lastName,
                        sellerIC: sellerICArr[i],
                        marketplaceItems: itemBySeller[i],
                        deliveryStatus: 'Order Placed',
                        orderDate: new Date(),
                        paymentDate: new Date()
                    })

                    newOrder.save().then(order => {

                        Cart.findByIdAndUpdate(cart._id, { items: [] }, function (err, doc) {
                            if (err) console.log(err)
                            else {
                                res.redirect('/recipient/')
                            }
                        })
                    })
                        .catch(e => console.log(e))
                })

            }
        }
    })

    //store new orders according to different sellers


})

router.post('/cart/add/:id', checkAuth, (req, res) => {
    Item.findById(req.params.id, function (e, item) {
        if (e) console.log(e)
        else {
            let items = []
            Cart.findOne({ userIC: req.user.noIC }, function (err, cart) {
                if (err) console.log(err)
                else items = cart.items
            })
            items.push({
                itemCoverUri: item.coverUri,
                itemID: item._id,
                itemName: item.itemName,
                itemPrice: item.itemPrice,
                sellerIC: item.sellerIC
            })
            Cart.findOneAndUpdate({ userIC: req.user.noIC }, { items: items }, function (err, cart) {
                if (err) console.log(err)
                else res.redirect('/recipient/cart')
            })
        }
    })

})

router.get('/cart', checkAuth, (req, res) => {
    Cart.findOne({ userIC: req.user.noIC }, function (err, cart) {
        if (err) console.log(err)
        else res.render('recipient/recipientCart.ejs', { items: cart.items })
    })
})

router.get('/login', checkNotAuth, (req, res) => {
    res.render('recipient/recipientLogin.ejs')
})

router.get('/register', checkNotAuth, (req, res) => {
    res.render('recipient/recipientRegister.ejs')
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
        else res.render('donor/donorSetting.ejs', { user: doc, messages: {} })
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
                res.render('donor/donorSetting.ejs', { user: req.user, messages: { error: ['password mismatched'] } })
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
                    res.render('register.ejs', { messages: { error: "user existed" } })
                }
            })
            .catch(err => console.log(err))
        const newCart = new Cart({

        })
    } catch {
        res.redirect('/donor/register')
    }
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/recipient/dashboard',
    failureRedirect: '/recipient/login',
    failureFlash: true,
}))

router.delete('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/recipient');
    });
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.RecipientActivated === 'true') {
            return next()
        } else {
            req.logout(function (err) {
                if (err) { return next(err); }
                res.redirect('/recipient');
            });
        }
    } else {
        res.redirect('/recipient/login')
    }

}

function checkNotAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/recipient/dashboard')
}

module.exports = router