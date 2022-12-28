if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const passport = require('passport')

const Order = require('../models/Order.js')

router.get('/ship/:id', checkAuth, (req, res) => {
    Order.findByIdAndUpdate(req.params.id, {deliveryStatus: "The parcel is shipped and delivered. "},  function (err, docs) {
        if (err) console.log(err)
        else {
            res.redirect('/order')
        }
    })
})

router.get('/:id', checkAuth, (req, res) => {
    Order.findById(req.params.id, function (err, docs) {
        if (err) console.log(err)
        else {
            res.render('order/orderDetails.ejs', { order: docs, totalAmount: 0})
        }
    })
})

router.get('/', checkAuth, (req, res) => {
    Order
        .find({ sellerIC: req.user.noIC })
        .sort({ createdAt: 'desc' })
        .exec(function (err, doc) {
            if (err) console.log(err)
            res.render('order/allOrders.ejs', { order: doc })
        });
})


function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/donor/login')
}

function checkNotAuth(req, res, next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/donor/dashboard')
}

module.exports = router