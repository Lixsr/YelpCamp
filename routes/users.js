const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user");
const passport = require("passport");


router.get('/register', (req, res) => {
    res.render('users/register');
});
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome To YelpCamp!');
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});
// We need to specify the strategy we want to use. local, google, github, facebook, ... etc.
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', 'Welcome Back!');
    res.redirect('/campgrounds');
}));

module.exports = router;