const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    operator: String,
    number: String,
    date: Date,
    departure: Date,
    arrival: Date,
    price: Number,
    source: String,
    destination: String,
    duration: Number,
});

module.exports =  bookingSchema;