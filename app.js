if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// db on atlas
const dbUrl = process.env.DB_URL;

// for authentication, we need passport, passport-local, passport-local-mongoose
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


// const localDB = "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);
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
app.use(mongoSanitize({ replaceWith: "_" }));

const store = new MongoStore({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, //don't update each time user visits. update after 24 hours
  crypto: {
    secret: process.env.SECRET,
  }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  // for one week
  cookie: {
    httpOnly: true, // true by default. prevent the cookie from being accessed by javascript
    // secure: true, // only send cookie over https. Use it when deploying.
    expires: Date.now() + 1000 * 3600 * 24 * 7,
    maxAge: 1000 * 3600 * 24 * 7
  }
}

app.use(session(sessionConfig));// must be before app.use(passport.session())
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ddjfk5dyz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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
  res.render('home');
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
