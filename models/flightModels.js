const mongoose = require('mongoose');
const { Schema } = mongoose;

const flightSchema = new Schema({
  number: String,
  seats: Number,
  date: Date,
  departure: Date,
  arrival: Date,
  price: Number,
  source: String,
  destination: String,
});

mongoose.model('flights', flightSchema);