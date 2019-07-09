const mongoose = require('mongoose');
const Flights = mongoose.model('flights');

module.exports = app => {
    app.post('/api/add-flights', (req,res) => {
        const flights = req.body;
        Flights.insertMany(flights, (err, doc) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                console.log(doc, "flights added");
                res.json({ doc: doc, message: "flights added" });
            }
        })
    });

    app.post('/api/search/flights', (req,res) => {
        const query = req.body;
        Flights.find({$and: query}, (err, doc) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                console.log(doc, "Flights found");
                res.json({doc, message: "Flights found"})
            }
        })
    });

    
}