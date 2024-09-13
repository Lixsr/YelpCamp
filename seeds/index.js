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
            author: '66daab085077699b331d5d5a',
            location: `${cities[rand].city}, ${cities[rand].state}, ${i}`,
            title: `${getRandomEl(descriptors)}, ${getRandomEl(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/ddjfk5dyz/image/upload/v1725884835/YelpCamp/m27tczqp6wbovmyx5pxm.jpg',
                    filename: 'YelpCamp/m27tczqp6wbovmyx5pxm',
                },
                {
                    url: 'https://res.cloudinary.com/ddjfk5dyz/image/upload/v1725884835/YelpCamp/ljzmjv7rgacyevycogqr.png',
                    filename: 'YelpCamp/ljzmjv7rgacyevycogqr',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eius, mollitia repellendus praesentium ea provident consectetur deserunt! Eos reprehenderit facilis aperiam! Nihil, alias. Eos, temporibus aspernatur! Perferendis consequuntur laborum facere labore.',
            price: Math.floor(Math.random() * 20) + 10,
            geometry: {
                type: "Point",
                coordinates: [49.537514, 26.661907]
            }
            
        });
        await newCamp.save();
    }
}
seedDB().then(() => {
    db.close();
});