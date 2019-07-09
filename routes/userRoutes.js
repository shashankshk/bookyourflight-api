const mongoose = require('mongoose');
const User = mongoose.model('user');
var bcrypt = require('bcrypt');
const saltRounds = 12;
module.exports = app => {
    app.post('/signin', async (req,res) => {
        const {name, email, phone, passoword} = req.body;
        const existingUser = await User.find({email});
        if(existingUser) {
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
            res.send({newUser, msg: "User created"});
        })
    });

    app.post('/login', function (req, res) {
        User.findOne({email: req.body.email}).then(function (user) {
            if (!user) {
               return res.send("User doesnt exist");
            } else {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (result == true) {
               res.redirect('/');
            } else {
            res.send('Incorrect password');
            res.redirect('/login');
           }
         });
        }
     });
   });

    
}