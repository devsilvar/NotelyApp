const UserModel = require( "../model/userModel" )
const AppError = require("../utils/AppError")
const createToken = require('../utils/createToken')
const {sendMail , verificationCodeMessage , welcomeMail } = require("../utils/sendMail")
const cloudinary = require("../config/cloudinary")
const { uploadToCloudinary , uploadProfilePicture } = require("../middleware/upload")
const NoteModel = require("../model/noteModel")

const formatUser = (user) =>({
    id:user.id,
    firstName:user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(), 
    role: user.role,
    email:user.email,
    isActive:user.isActive,
    profilePicture: user.profileImage || ""
})


exports.registerUser = async(req, res , next)=>{
try{
    const { firstName , lastName ,role , email , password} = req.body

    //validate that a suer enters all necessary details
    if(!email || !password || !firstName || !lastName || !role){
          return next(AppError('firstname , lastname , email , password and role are all required' , 400))
    }

    //check whether the email is not in our system before
    const user = await UserModel.findOne({email:email})

    if(user){
        return next(AppError('user Account already exits' , 400))
      }

    //create a new user
    const newUser = await UserModel.create({email , password , firstName , lastName , role})
    
    if(!newUser){
        return next(AppError('user Account already exits' ,  401))
    } 
    
    
    //create a token..
    const token =  createToken(newUser._id , newUser.role)

    const {subject , html} = welcomeMail(newUser.firstName)
    await sendMail({to: newUser.email , subject , html})


    res.status(200).json({
        message: "User sucessfully registered",
        token: token,
        data: formatUser(newUser)
    })
}catch(err){
  console.log(err)
  next(err)
  }
}



exports.loginUser = async(req, res, next)=>{
    try{
     const {email , password} = req.body

     if(!email || !password){
        return next(AppError("Email and Password are required" , 400))
     }

     //check wher ether the user details are correct i.e talies with the oen is our databse

     const checkUser = await UserModel.findOne({email}).select("+password")


     if(!checkUser  ||  !(await checkUser.checkPassword(password))){
        return next(AppError("Incorrect Email or Pasword" , 401))
     } 

     const token = createToken(checkUser._id , checkUser.role)

     res.status(200).json({
        message: "You have logged in",
        token : token,
        data:formatUser(checkUser)
     })

    }catch(err){
        console.log(err)
      next(err)
    }
}



exports.getUserProfile = async(req, res, next)=>{
    const {userId} = req.user

    try{
      const getUser = await UserModel.findById(userId)
      
      if(!getUser){
        return next(AppError("User is Invalid , Login now" , 401))
      }
      res.status(200).json({
        message: "user profile fetched",
        data: formatUser(getUser)
      })
    }catch(err){
     console.log(err)
     next(err)
    }
}


exports.changePassword = async(req, res, next)=>{
    const {userId} = req.user
    try{
     const {newPassword , oldPassword} = req.body

     //check that this oldpassword is even correct
     const checkUser = await UserModel.findById(userId).select('+password')

     if(!checkUser){
        return next(AppError("Invalid User Id / User Not Logged in"))
     }

     const status = await checkUser.checkPassword(oldPassword) 

     if(!status){
        return next(AppError("Password not Correct" , 401))
     }

    checkUser.password = newPassword
    await checkUser.save()

     //create a fresh token after chnage in oassword
     const token = createToken(checkUser._id , checkUser.role)

     res.status(200).json({
        message:"succesfully Changed Password",
        data: formatUser(checkUser)
     })

    }catch(err){
    console.log(err)
    next(err)
    }
}


exports.forgetPassword = async(req, res, next)=>{
    const {email} = req.body
    try{
      //verify that teh email is in our databse
      const checkUserMail = await UserModel.findOne({email})

      if(!checkUserMail){
        return next(AppError("If your email exist in our system, you;ll get a mail" , 400))
      }
       
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      const {subject , html}  = verificationCodeMessage(verificationCode)

      const result = await sendMail({to: checkUserMail.email , subject , html})

      if(result &&  result.accepted[0]  === checkUserMail.email){
        checkUserMail.forgetPasswordVerificationTime = Date.now()
        checkUserMail.forgetPasswordCode  = verificationCode
        await checkUserMail.save()
      }

      res.status(200).json({
        message: "Verification Code has been sent your mail"
      })
    }catch(err){
   console.log(err)
   next(err)
    }
}


exports.verifyForgetPasswordCode = async(req, res, next)=>{
   try{
 const {email , validationCode , newPassword} = req.body

  //check if this email belongs to a user in our databse

  const user = await UserModel.findOne({email}).select("+ forgetPasswordCode +forgetPasswordVerificationTime")

  if(!user){
   return next(AppError("Invalid User" , 404))
  } 
    // !=not  + false == true
  
   //check if teh validation code is the one in our db 
   if(user.forgetPasswordCode  !== validationCode){
       return next(AppError("Invalid verification Code" , 400))
   }

   //check if the token is still valid
   if(Date.now()  - user.forgetPasswordVerificationTime > 5 * 60 * 1000){
         return next(AppError("Code expired" , 400)) 
   }
   
   user.password = newPassword
   user.forgetPasswordVerificationTime = undefined
   await user.save()

   res.status(200).json({
    message:"Sucessfully changed your password"
   })

   }catch(err){
    console.log(err)
    next(err)
   }
}


exports.uploadProfilePicture = async(req, res, next)=>{
  const {userId} = req.user
  try{
//cloudinary
//check if a file was uplaoded
if(!req.file){
   return next(AppError("Kinldy upload a picture" , 400))
}

const user = await UserModel.findById(userId)

//deleting teh current image location in in cloudinary
if(user.profileImage && user.profileImagePublicId){
  await cloudinary.uploader.destroy(user.profileImagePublicId)
}


//we uplaod to cloudinary
const result = await uploadToCloudinary(req.file.buffer , {
  folder: "notely/avatars",
  transformation:[{width:'400' , height: '400' , crop:'fill' , gravity:"north"}],
  resource_type:"image" ,
})

user.profileImage = result.secure_url
user.profileImagePublicId = result.public_id
await user.save()

res.status(200).json({
  mnessage:"Profile picture updated",
  data:formatUser(user)
})
   
  }catch(err){
    console.log(err)
    next(err)
  }
}


exports.getAllUsers = async(req, res, next)=>{
  try{
    const customers = await UserModel.find({role:'customer'}).sort({createdAt: -1})
    const userStats = await Promise.all(
      customers.map(async (customer)=>{
          const totalNotes = await NoteModel.countDocuments({user: customer._id}) 
          const pinnedNotes = await NoteModel.countDocuments({user: customer._id , isPinned: true})
          const archivedNotes = await NoteModel.countDocuments({user:customer._id , isArchived: true})

          return{
            user: formatUser(customer),
            stats:{
              totalNotes,
              pinnedNotes,
              archivedNotes,
              activeNotes: totalNotes -  archivedNotes
            },
          }
      })
    )

    res.status(200).json({
      message: "Sucessfully fecthed all user",
      data: {users:userStats }
    })

  }catch(err){
  console.log(err)
  next(err)
  }
}

//deativate-user/:id

exports.deactivateUser = async(req, res, next)=>{
try{
  const user = await UserModel.findByIdAndUpdate(req.params.id , {isActive: false } , {returnDocument: "after" , runValidators: true})

  if(!user){
    return next(AppError("User not Found" , 404))
  }

  res.status(200).json({
    message: "Succesfully deactivated user",
    data: formatUser(user)
  })
}catch(err){
console.log(err)
next(err)
 }
}



exports.activateUser = async(req, res, next)=>{
try{
  const user = await UserModel.findByIdAndUpdate(req.params.id , {isActive:true} , {returnDocument: "after" , runValidators: true})

  if(!user){
    return next(AppError("User not Found" , 404))
  }

  res.status(200).json({
    message: "Succesfully activated user",
    data: formatUser(user)
  })
}catch(err){
console.log(err)
next(err)
 }
}