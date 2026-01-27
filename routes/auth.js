const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');

// create a User using: POST "/api/auth/". Doesn't require Auth  
router.post('/',[
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Please enter a unique value for email').isLength({min: 5}),
    body('password', 'Password must be atleast 8 Characters').isLength({min: 8}),
], (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error: error.array()});
    }
    User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
    }).then(user => res.json(user))
    .catch(err => {console.log(err)
        res.json({error:" Please Enter a unique value for email"})
    })
      
})

module.exports = router