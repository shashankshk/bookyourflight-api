const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const app = express();
require('./models/flightModels');
require('./models/userModel');
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization,Accept,Content-Type"
  );

  next();
});

mongoose.connect("mongodb://localhost/bookYourFlight", {useNewUrlParser: true});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

require('./routes/flightRoutes')(app);
require('./routes/userRoutes')(app);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`listening at ${port}`));
