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
const Donation = require('../models/Donation');

var items = []
var details = {
    donationDate: '',
    amountAvailable: 0
}

router.get('/add', checkAuth, (req, res) => {
    res.render('donation/addDonation.ejs', { items: [] })
})

router.post('/addDonationItem', upload.single("photo"), async (req, res) => {
    try {
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
            const item = {
                itemUri: result?.secure_url || '',
                itemCloudinaryID: result?.public_id || '',
                itemName: req.body.itemName,
                itemExpiryDate: req.body.itemExpiryDate,
                itemQuantity: req.body.itemQuantity
            };
            items.push(item)
            res.render('donation/addDonation.ejs', { items: items })
        } else {
            console.log('no file to upload')
        }
    } catch (e) {
        console.log(e)
    }
})

function resetItem() {
    items = []
}

function removeItem(index) {
    if (index > -1) { // only splice array when item is found
        items.splice(index, 1); // 2nd parameter means remove one item only
    }
}

// route to cancel donation
router.get('/cancel', (req, res) => {
    items.forEach(async (item) => {
        var result = await cloudinary.uploader.destroy(item.itemCloudinaryID)
    })
    resetItem()
    res.redirect('/')
})

// route to delete donation item - update
router.get('/deleteItemUpdate/:index/:id', async (req, res) => {
    var result = await cloudinary.uploader.destroy(items[req.params.index].itemCloudinaryID)
    removeItem(req.params.index)
    Donation.findByIdAndUpdate(req.params.id, { items: items }, { new: true }, function (e, docs) {
        if (e) console.log(e)
        else res.render('donation/donationDetails.ejs', { donation: docs })
    })
})

router.post('/updateDonation/:id', (req, res) => {
    Donation.findByIdAndUpdate(
        req.params.id,
        {
            donationDate: req.body.donationDate,
            amountAvailable: req.body.donationQuantity
        },
        { new: true },
        function (e, docs) {
            if (e) console.log(e)
            else res.redirect('/')
        })
})

router.post('/editItemUpdate/:index/:id', (req, res)=>{
    items[req.params.index].itemName = req.body.itemNameEdit
    items[req.params.index].itemExpiryDate = req.body.itemExpiryDateEdit
    items[req.params.index].itemQuantity = req.body.itemQuantityEdit
    Donation.findByIdAndUpdate(req.params.id, { items: items }, { new: true }, function (e, docs) {
        res.render('donation/donationDetails.ejs', { donation: docs })
    })
})

router.post('/editItem/:index', (req, res)=>{
    items[req.params.index].itemName = req.body.itemNameEdit
    items[req.params.index].itemExpiryDate = req.body.itemExpiryDateEdit
    items[req.params.index].itemQuantity = req.body.itemQuantityEdit
    res.render('donation/addDonation.ejs', { items: items })
})

// route to add donation item - update
router.post('/addItemUpdate/:id', upload.single("photo"), async (req, res) => {
    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
        const item = {
            itemUri: result?.secure_url || '',
            itemCloudinaryID: result?.public_id || '',
            itemName: req.body.itemName,
            itemExpiryDate: req.body.itemExpiryDate,
            itemQuantity: req.body.itemQuantity
        };
        items.push(item)
        Donation.findByIdAndUpdate(req.params.id, { items: items }, { new: true }, function (e, docs) {
            res.render('donation/donationDetails.ejs', { donation: docs })
        })
    }
})

// route to delete donation item
router.get('/deleteItem/:index', async (req, res) => {
    var result = await cloudinary.uploader.destroy(items[req.params.index].itemCloudinaryID)
    removeItem(req.params.index)
    res.render('donation/addDonation.ejs', { items: items })
})

// route to delete donation
router.post('/delete/:id', (req, res) => {
    Donation.findByIdAndDelete(req.params.id, function (err, doc) {
        doc.items.forEach(async (item) => {
            var result = await cloudinary.uploader.destroy(item.itemCloudinaryID)
        })
        resetItem()
        res.redirect('/')
    })
})

// route to add new donation
router.post('/add', (req, res) => {
    const newDonation = new Donation({
        items: items,
        amountAvailable: req.body.donationQuantity,
        recipients: [],
        donationDate: req.body.donationDate,
        donorIC: req.user.noIC,
        donorName: req.user.firstName+' '+req.user.lastName,
        donorAvatarUri: req.user.avatarUri
    })
    resetItem()

    newDonation.save()
        .then((donation) => {
            res.redirect('/donor/dashboard');
        })
        .catch(err => console.log(err))
})

// route to get details of a donation
router.get('/:id', checkAuth, (req, res) => {
    Donation.findById(req.params.id, function (err, docs) {
        if (err) console.log(err)
        else {
            items = docs.items
            res.render('donation/donationDetails.ejs', { donation: docs })
        }
    })
})

// route to get all donation
router.get('/', checkAuth, (req, res) => {
    Donation
        .find({ donorIC: req.user.noIC })
        .sort({ createdAt: 'desc' })
        .exec(function (err, doc) {
            if (err) console.log(err)
            res.render('donation/allDonation.ejs', { donation: doc })
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