const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('./../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const getRandomEl = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const newCamp = await new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}, ${i}`,
            title: `${getRandomEl(descriptors)}, ${getRandomEl(places)}`
        });
        await newCamp.save();
    }
}
seedDB().then(() => {
    db.close();
});