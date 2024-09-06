const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

// for authentication, we need passport, passport-local, passport-local-mongoose
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// serve static files. such as validateForms.js
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "top-secret",
  resave: false,
  saveUninitialized: true,
  // for one week
  cookie: {
    httpOnly: true, // true by default. prevent the cookie from being accessed by javascript
    expires: Date.now() + 1000 * 3600 * 24 * 7,
    maxAge: 1000 * 3600 * 24 * 7
  }
}

app.use(session(sessionConfig));// must be before app.use(passport.session())

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// How user is stored in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// save to locals.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // Flash messages
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

app.use('/', userRoutes);

app.use('/campgrounds', campgroundRoutes);
// mergeParams is needed to access :id//
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get("/", (req, res) => {
  res.redirect("/campgrounds");
});


app.all("*", (req, res, next) => {
  next(new ExpressError("PAGE NOT FOUND", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", {
    err,
  });
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
