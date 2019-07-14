const mongoose = require('mongoose');
const User = mongoose.model('user');
var bcrypt = require('bcrypt');
const saltRounds = 12;
module.exports = app => {
    app.post('/signin', async (req,res) => {
        console.log(req.body, "req for signin")
        const {name, email, phone, passoword} = req.body;
        const existingUser = await User.find({email});
        if(existingUser.length) {
            return res.send({msg:"User already exists"});
        }
        bcrypt.hash(req.body.password, saltRounds, async function (err,   hash) {
            const user = new User({
                name,
                email,
                phone,
                password: hash
            });
            const newUser = await user.save();
            const {name: newUserName, email: newUserEmail, id} = newUser;
            const data = {newUserName, newUserEmail, id}
            res.send({data, msg: "Sign in succesfull."});
        })
    });

    app.post('/login', function (req, res) {
        User.findOne({email: req.body.email}).then(function (user) {
            if (!user) {
               return res.send({msg: "User doesn't exist"});
            } else {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (result == true) {
                const data = {
                    name: user.name,
                    email: user.email
                }
                res.send({data, msg: "Login succesfull"});
            } else {
                res.send({msg: 'Incorrect password'});
                res.redirect('/login');
           }
         });
        }
     });
   });
   app.post('/api/my-bookings', function(req, res) {
       User.findOne({email: req.body.email}, (err, doc) => {
           if(err) {
               console.log(err);
           }
           res.send({
               isBookingSuccesful: false,
               bookings: doc.bookings
           })
       })
   })
    
}