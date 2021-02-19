const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
//User model
const User = require('../models/User');

const passport = require('passport');


//login
router.get('/login', (req, res) => {
    res.render('login');
    console.log(global.reqs);
});

//register
router.get('/register', (req, res) => res.render('register'));
module.exports = router;

//register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password < 6) {
        errors.push({ msg: 'The password must contain at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email
        });
    } else {
        // si tout est ok
        
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //user exists
                    errors.push({ msg: 'Email is already registerd' });
                    res.render('register', {
                        errors,
                        name,
                        email
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    // hash password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;

                        newUser.password = hash;
                        //enregistrement du user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'you are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    }))
                    
                }
            });
         
    }

    //check pass length
});


//login handles
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

module.exports = router;

//logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});