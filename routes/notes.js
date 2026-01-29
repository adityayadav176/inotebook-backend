const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser.js');
const Note = require('../models/Note.js');
const { body, validationResult } = require('express-validator');

//ROUTE 1 Get all Notes using: GET "/api/notes/fetchallnotes".login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 1 add a new note using: Post "/api/notes/addnote".login required
router.post('/addnote', fetchuser, [
    body('title', 'Title must be atleast 3 Characters').isLength({ min: 3 }),
    body('description', 'Description must be atleast 8 Characters').isLength({ min: 8 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // If there are error, return Bad request and the errors 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    } catch (error) {
        res.status(500).send("Internal Server Error");
        console.error(error.message)
    }
})
module.exports = router