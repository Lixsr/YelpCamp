if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
// storeURL will be used to store the return url after login
const { isLoggedIn, isAuthor, validateCampground, storeURL } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.array('image'), (req, res) => {
        // console.log(req.body, req.files); to be filled

    })

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Order is important. in /new, new might be considered :id if /:id comes first
router.route('/:id')
    .get(storeURL, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;