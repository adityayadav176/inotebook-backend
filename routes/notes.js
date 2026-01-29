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

//ROUTE 2 add a new note using: Post "/api/notes/addnote".login required
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
//ROUTE 3 Update note using:Put "/api/notes/updatenote/:id".login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
     const {title, description, tag } = req.body;
     //Create a newNote object
     const newNote = {};
     if(title){newNote.title = title};
     if(description){newNote.description = description};
     if(tag){newNote.tag = tag};

     //Find the note to be updated and updated it
     let note = await Note.findById(req.params.id);
     if(!note){
       return res.status(404).send("Not Found");
     }
     if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
     }

     note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
     res.json({note});
})
module.exports = router