const userModel = require("../model/userModel")
const express = require('express')
const userController = require("../controller/userController")
const validate = require("../middleware/validate")
const {registerSchema , loginSchema , changePasswordSchema , forgetPasswordSchema ,verifyforgetPasswordCodeSchema} = require("../validations/userValidation")
const protect = require("../middleware/protect")
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({storage})
const restrictTo = require("../middleware/restrictTo")
const noteController = require("../controller/notesController")
const {createNoteSchema , updateNoteSchema} = require("../validations/notesvalidation")
const {addNoteLimiter} = require("../config/rateLimit")
const router = express.Router()

router.use(protect)

//get all his notes
router.get("/"  ,  noteController.getAllNotes)

//create a note
router.post("/" , addNoteLimiter, validate(createNoteSchema) , noteController.createNewNote)

//get a note
router.get("/:id" , noteController.getNote)


//update a note
router.patch("/:id" , validate(updateNoteSchema), noteController.updateNote)


//delet a note
router.delete("/:id" , noteController.deleteNote)

//get information of a single note :/id
router.patch("/:id" , noteController.updateNote)


router.patch("/picture/:id" ,   upload.single("coverImage") , noteController.uploadCoverImage)


//toggle the pin state  
router.patch("/:id/pin" ,  noteController.togglePin)

//toggle archive
router.patch("/:id/archive" , noteController.toggleArchive)

//toggle the archive state
router.get("/all-tags" , noteController.getAllTags)


module.exports = router