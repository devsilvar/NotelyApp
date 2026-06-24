//we need to be able to authorize each user role
const AppError = require("../utils/AppError")

const restrictTo = (...roles) =>{
  return (req, res, next)=>{
    if(!roles.includes(req.user.role)){
        return next(AppError("You are not authorized to acess that" , 400))
    }
    next()
  }
}

module.exports = restrictTo

