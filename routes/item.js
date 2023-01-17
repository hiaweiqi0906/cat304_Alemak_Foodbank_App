if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const router = express()
const upload = require('../utils/multer')
const cloudinary = require("../utils/cloudinary");
const Donation = require('../models/Donation');
const Item = require('../models/Item');

var items = []

router.get('/add', checkAuth, (req, res) => {
    res.render('marketplace/addItem.ejs')
})

router.get('/delete/:id/:index', (req, res) => {
    Item.findById(req.params.id, function (err, item) {
        index = req.params.index

        itemNewUri = item.itemUri
        itemNewCloudinaryId = item.itemCloudinaryId
        if (index > -1) { // only splice array when item is found
            itemNewUri.splice(index, 1); // 2nd parameter means remove one item only
            itemNewCloudinaryId.splice(index, 1); // 2nd parameter means remove one item only
        }
        Item.findByIdAndUpdate(req.params.id, {
            itemUri: itemNewUri,
            itemCloudinaryId: itemNewCloudinaryId
        }, function (err, doc) {
            if (err) console.log(err)
            else res.redirect(`/donor/item/${req.params.id}`)
        })
    })
})

router.post('/edit/:id', upload.fields([{ //upload pic to db
    name: 'coverImg', maxCount: 1
}, {
    name: 'img1', maxCount: 1
}, {
    name: 'img2', maxCount: 1
}, {
    name: 'img3', maxCount: 1
}]), (req, res) => {
    Item.findById(req.params.id, async (err, item) => {
        if (err) console.log(err)
        if (req.files) {
            let imgUri = []
            let imgID = []
            let result
            if (req.files.coverImg) {
                //upload new
                result = await (cloudinary.uploader.upload(req.files.coverImg[0].path))

                //delete old
                await cloudinary.uploader.destroy(item.coverCloudinaryId)

                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //push old img Id
                //push old img Uri
                imgUri.push(item.coverUri)
                imgID.push(item.coverCloudinaryId)
            }
            if (req.files.img1) {
                //if got old, 
                //delete old
                if (item.itemUri[0]) await cloudinary.uploader.destroy(item.itemCloudinaryId[0])
                //upload new
                result = await (cloudinary.uploader.upload(req.files.img1[0].path))
                //push result img Id
                //push result img Uri
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //if got old
                //push old img Id
                //push old img Uri
                if (item.itemUri[0]) {
                    imgID.push(item.itemCloudinaryId[0])
                    imgUri.push(item.itemUri[0])
                };
            }

            if (req.files.img2) {
                if (item.itemUri[1]) await cloudinary.uploader.destroy(item.itemCloudinaryId[1])
                result = await (cloudinary.uploader.upload(req.files.img2[0].path))
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                if (item.itemUri[1]) {
                    imgID.push(item.itemCloudinaryId[1])
                    imgUri.push(item.itemUri[1])
                };

            }

            if (req.files.img3) {
                //if got old, 
                //delete old
                if (item.itemUri[2]) await cloudinary.uploader.destroy(item.itemCloudinaryId[2])
                //upload new
                result = await (cloudinary.uploader.upload(req.files.img3[0].path))
                //push result img Id
                //push result img Uri
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //if got old
                //push old img Id
                //push old img Uri
                if (item.itemUri[2]) {
                    imgID.push(item.itemCloudinaryId[2])
                    imgUri.push(item.itemUri[2])
                };
            }

            //check all info entered
            const coverImgId = imgID.shift()
            const coverImgUri = imgUri.shift()

            Item.findByIdAndUpdate(req.params.id, {
                coverUri: coverImgUri,
                coverCloudinaryId: coverImgId,
                itemUri: imgUri,
                itemCloudinaryId: imgID,
                itemName: req.body.itemName,
                itemExpiryDate: req.body.itemExpiryDate,
                itemQuantity: req.body.itemQuantity,
                sellerIC: req.user.noIC,
                sellerAddress: req.user.address,
                itemDescription: req.body.itemDescription,
                itemPrice: req.body.itemPrice
            }, function (err, item) {
                if (err) console.log(err)
                else {
                    console.log('updated')
                    res.redirect('/')
                }
            })
        }
    })
})

router.post('/add', upload.fields([{ //upload pic to db
    name: 'coverImg', maxCount: 1
}, {
    name: 'img1', maxCount: 1
}, {
    name: 'img2', maxCount: 1
}, {
    name: 'img3', maxCount: 1
}]), async (req, res) => {
    try {

        const newFiles = [];
        if (req.files.coverImg) {
            newFiles.push(req.files.coverImg[0]);
        }
        if (req.files.img1) {
            newFiles.push(req.files.img1[0]);
        }
        if (req.files.img2) {
            newFiles.push(req.files.img2[0]);
        }
        if (req.files.img3) {
            newFiles.push(req.files.img3[0]);
        }
        let imgUri = []
        let imgID = []
        for (let i = 0; i < newFiles.length; i++) {
            var result = await (cloudinary.uploader.upload(newFiles[i].path))
            imgUri.push(result.secure_url)
            imgID.push(result.public_id)
        }
        const coverImageUri = imgUri.shift()
        const coverImageId = imgID.shift()

        const newItem = new Item({
            coverUri: coverImageUri,
            coverCloudinaryId: coverImageId,
            itemUri: imgUri,
            itemCloudinaryId: imgID,
            itemName: req.body.itemName,
            itemExpiryDate: req.body.itemExpiryDate,
            sellerIC: req.user.noIC,
            sellerName: req.user.firstName+' '+req.user.lastName,
            sellerAvatarUri: req.user.avatarUri,
            sellerAddress: req.user.address,
            itemDescription: req.body.itemDescription,
            itemPrice: req.body.itemPrice,
            itemQuantity: req.body.itemQuantity
        })

        newItem.save()
            .then(() => {
                res.redirect('/')
            })
            .catch((e) => {
                console.log(e)
            })
        // -----------------------------------------

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

router.post('/editItemUpdate/:index/:id', (req, res) => {
    items[req.params.index].itemName = req.body.itemNameEdit
    items[req.params.index].itemExpiryDate = req.body.itemExpiryDateEdit
    items[req.params.index].itemQuantity = req.body.itemQuantity
    Donation.findByIdAndUpdate(req.params.id, { items: items }, { new: true }, function (e, docs) {
        res.render('donation/donationDetails.ejs', { donation: docs })
    })
})

router.post('/editItem/:index', (req, res) => {
    items[req.params.index].itemName = req.body.itemNameEdit
    items[req.params.index].itemExpiryDate = req.body.itemExpiryDateEdit
    items[req.params.index].itemQuantity = req.body.itemQuantity
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
        donorIC: req.user.noIC
    })
    resetItem()

    newDonation.save()
        .then((donation) => {
            res.redirect('/donor/dashboard');
        })
        .catch(err => console.log(err))
})

// route to get details of a item
router.get('/:id', checkAuth, (req, res) => {
    Item.findById(req.params.id, function (err, docs) {
        if (err) console.log(err)
        else {
            res.render('marketplace/itemDetails.ejs', { item: docs })
        }
    })
})

// route to get all items
router.get('/', checkAuth, (req, res) => {
    Item
        .find({ sellerIC: req.user.noIC })
        .sort({ createdAt: 'desc' })
        .exec(function (err, doc) {
            if (err) console.log(err)
            else res.render('marketplace/allItems.ejs', { item: doc })
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