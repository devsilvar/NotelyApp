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
const { loginLimiter, registerLimiter} = require("../config/rateLimit")


const router = express.Router()



//register a user
router.post("/register" , registerLimiter,  validate(registerSchema) , userController.registerUser)


//login a user
router.post("/login" , loginLimiter,  validate(loginSchema) , userController.loginUser)


//getUserprofile
router.get("/user-profile" ,  protect , userController.getUserProfile)

//change password
router.patch("/change-password" , protect , validate(changePasswordSchema) ,  userController.changePassword)



//forget pasword
router.patch("/forget-password" , validate(forgetPasswordSchema) ,  userController.forgetPassword)


router.patch("/verify-code" , validate(verifyforgetPasswordCodeSchema) , userController.verifyForgetPasswordCode)

router.patch("/upload-profile-picture" , upload.single("profilePicture") , protect, userController.uploadProfilePicture)

//admin apis
//get all the users
router.get("/all-user" , protect , restrictTo("admin")  , userController.getAllUsers)
//deactivate a user
router.patch("/deactivate-user" , protect , restrictTo("admin") , userController.deactivateUser)

//activate user
router.patch("/activate-user" , protect , restrictTo("admin") , userController.activateUser)


module.exports = router



