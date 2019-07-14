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
            //this queue is a "Direct reply-to" read more at the docs
            //When some msg comes in, we "emit" a message to the proper "correlationId" listener
            // ch.consume('amq.rabbitmq.reply-to', msg => {
            //   console.log(JSON.parse(msg.content), 'receieved')
            // }, {noAck: true});
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
                console.log(doc, "flights added");
                res.json({ doc: doc, message: "flights added" });
            }
        })
    });

    app.post('/api/add-flight', (req,res) => {
        const flight = req.body;
        console.log(req);
        Flights.create(flight, (err, doc) => {
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
        // const query = req.body;
        // console.log(query,'/////');
        // const flights = [];
        init().then(() => {
            let data = req.body;
            const dataToSend = {action: 'search', query: data};
            console.log(dataToSend, 'datatosend/////')
            let id = randomid();
            channel.assertQueue(QUEUE)
            //Sent the buffered img to the queue with the ID and the responseQueue
            .then(() => channel.sendToQueue(QUEUE, new Buffer.from(JSON.stringify(dataToSend)), {correlationId:id, replyTo: 'amq.rabbitmq.reply-to'}));

            channel.consume('amq.rabbitmq.reply-to', msg => {
                console.log(JSON.parse(msg.content), 'receieved')
                res.send(JSON.parse(msg.content))
            }, {noAck: true});
        });
    });

    app.post('/api/book/flight', (req, res) => {
        console.log(req.body, 'book request')
        init().then(() => {
            let data = req.body;
            const dataToSend = {action: 'book', query: data};
            console.log(dataToSend, 'datatosend/////')
            let id = randomid();
            channel.assertQueue(QUEUE)
            .then(() => channel.sendToQueue(QUEUE, new Buffer.from(JSON.stringify(dataToSend)), {correlationId:id, replyTo: 'amq.rabbitmq.reply-to'}));

            channel.consume('amq.rabbitmq.reply-to', async msg => {
                console.log(JSON.parse(msg.content), 'receieved');
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