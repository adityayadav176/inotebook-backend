const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "Mynameisaditya"

//ROUTE 1 Create a User using: POST "/api/auth/createuser". No login required  
router.post('/createuser', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('password', 'Password must be atleast 8 Characters').isLength({ min: 8 }),
], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    // Check whether the user with this email exists already 
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }
        // Store the Salt for bcrypt data
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 2 Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    // If there are errors, return Bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
        
    } catch (error) {
         res.status(500).send("Internal Server Error");
    }
})

//ROUTE 3 Get loggedin User details using: POST "/api/auth/getuser". No login required
module.exports = router;
