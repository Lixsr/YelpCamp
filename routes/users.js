const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user");

const passport = require("passport");
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register));


// We need to specify the strategy we want to use. local, google, github, facebook, ... etc.
// storeReturnTo stores the recent route, authernticate will validate the user and then redirect the user to the recent route
router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo,
        passport.authenticate('local',
            { failureFlash: true, failureRedirect: '/login' }
        ),
        catchAsync(users.login));

router.get('/logout', users.logout);

module.exports = router;
