const jwt = require("jsonwebtoken")
const UserModel = require("../model/userModel")
const AppError = require('../utils/AppError')


const protect = async(req, res, next)=>{
     

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ){
        token = req.headers.authorization.split(" ")[1]
    }

     if(!token){
      return next(AppError("You are not Logged in" , 401))
     }

     //verify that th token is legit
     let decoded;
     try {
        decoded = jwt.verify(token ,  process.env.JWT_SECRET);
     } catch (error) {
        return next(AppError(`${error.message} ||  'Invalid Token or session Expired'` , 401))
    }

    // {userId , role}
const checkUser = await UserModel.findById(decoded.userId)
if(!checkUser){
    return next(AppError("User does not exist" , 401))
  }
  if(!checkUser.isActive){
    return next(AppError("User is not Active , Kinldy contact Admin to activate" , 401))
  }

req.user = decoded
next()
}


module.exports = protect