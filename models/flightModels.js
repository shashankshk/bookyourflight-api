const mongoose = require('mongoose');
const { Schema } = mongoose;

const flightSchema = new Schema({
    operator: String,
    number: String,
    seats: Number,
    date: Date,
    departure: Date,
    arrival: Date,
    price: Number,
    source: String,
    destination: String,
    duration: Number,
});

mongoose.model('flights', flightSchema);