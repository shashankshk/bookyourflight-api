const mongoose = require('mongoose');
const User = mongoose.model('user');
const Flights = mongoose.model('flights');

function randomid() {
    return new Date().getTime().toString() + Math.random().toString() + Math.random().toString();
}
let channel = null;
//queue name
const QUEUE = 'indigoqueue';

function init() {
    return require('amqplib').connect('amqp://localhost')
        .then(conn => conn.createChannel())
        .then(ch => {
            channel = ch;
            channel.purgeQueue(QUEUE);
        });
  }
module.exports = (app) => {
    app.post('/api/add-flights', (req,res) => {
        const flights = req.body;
        Flights.insertMany(flights, (err, doc) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                res.json({ doc: doc, message: "flights added" });
            }
        })
    });

    app.post('/api/add-flight', (req,res) => {
        const flight = req.body;
        Flights.create(flight, (err, doc) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                res.json({ doc: doc, message: "flights added" });
            }
        })
    });
    
    app.post('/api/search/flights', (req,res) => {
        init().then(() => {
            let data = req.body;
            const dataToSend = {action: 'search', query: data};
            let id = randomid();
            channel.assertQueue(QUEUE)
            //Sent the buffered img to the queue with the ID and the responseQueue
            .then(() => channel.sendToQueue(QUEUE, new Buffer.from(JSON.stringify(dataToSend)), {correlationId:id, replyTo: 'amq.rabbitmq.reply-to'}));

            channel.consume('amq.rabbitmq.reply-to', msg => {
                res.send(JSON.parse(msg.content))
            }, {noAck: true});
        });
    });

    app.post('/api/book/flight', (req, res) => {
        init().then(() => {
            let data = req.body;
            const dataToSend = {action: 'book', query: data};
            let id = randomid();
            channel.assertQueue(QUEUE)
            .then(() => channel.sendToQueue(QUEUE, new Buffer.from(JSON.stringify(dataToSend)), {correlationId:id, replyTo: 'amq.rabbitmq.reply-to'}));

            channel.consume('amq.rabbitmq.reply-to', async msg => {
                const doc = JSON.parse(msg.content)
                if(JSON.parse(msg.content)) {
                    User.findOneAndUpdate({email: data.user.email},{$push :{bookings: doc}},{new: true}, (err, data) => {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                        }
                        res.json({
                            isbookingSuccesfull: true,
                            ...data.toObject()
                        })
                    } )
                }
            }, {noAck: true});
            
        });
    })
    
}