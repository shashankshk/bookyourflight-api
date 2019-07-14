const mongoose = require('mongoose');
const { Schema } = mongoose;
const bookingSchema = require('./bookingModel');

const userSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    bookings: [bookingSchema]
});

mongoose.model('user', userSchema);