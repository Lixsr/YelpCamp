const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// add username(Makes sure it's unique), password and methods.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);