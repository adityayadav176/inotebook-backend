const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');

// create a User using: POST "/api/auth/createuser". No login required  
router.post('/createuser',[
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'enter a valid name').isLength({min: 3}),
    body('password', 'Password must be atleast 8 Characters').isLength({min: 8}),
],  async (req, res) => {
    // If there are errors, return Bad request and the errors
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error: error.array()});
    }
    // Check whether the user with this email exists already 
    try{
        let user = await User.findOne({ email: req.body.email });
        if(user){
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }
        //Create a new user
        user = await User.create({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
        })  
        res.json(user)
    }catch (error){
        res.status(500).send("Some error occured");
    }
})

module.exports = router;
