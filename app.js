const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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
app.use(session(sessionConfig));



app.use('/campgrounds', campgrounds);
// mergeParams is needed to access :id//
app.use('/campgrounds/:id/reviews', reviews);


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
