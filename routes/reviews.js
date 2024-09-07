const express = require("express");
// Merge params allows us to access variables from app.js. such as :id variable.
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const { reviewSchema } = require("../schemas");




router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));
router.get('/:reviewId', isLoggedIn, reviews.returnToCampground);

module.exports = router;