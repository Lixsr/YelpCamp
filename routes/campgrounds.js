const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const campgrounds = require("../controllers/campgrounds");

// storeURL will be used the store the return url after login
const { isLoggedIn, isAuthor, validateCampground, storeURL } = require('../middleware');



router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));


router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Order is important. in /new, new might be considered :id if /:id comes first
router.route('/:id')
    .get(storeURL, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;