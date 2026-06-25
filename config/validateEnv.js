
const AppError = require("../utils/AppError")
const validateEnv = () =>{
    const required = [
    'MONGO_URI',
    'NODE_ENV', 
    'JWT_SECRET', 
    'JWT_EXPIRES_IN', 
    'NODEMAILER_EMAIL', 
    'NODEMAILER_PASSWORD', 
    'CLOUDINARY_CLOUD_NAME', 
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET', 
    'CLIENT_URL'
    ]
const missing = required.filter( item => !process.env[item] )



if( missing.length > 0){
   console.error(`Missing Environment Vairble  ${missing.join(",")}`)
   process.exit(1)
}

if(process.env.JWT_SECRET.length < 32){
   console.error(`JWT SECRET too short must ot be less than 32 characters`)
   process.exit(1)
}

// const name = {male: "bola"}
// name.male == bola
// name['male']

console.log("`All Env varibles correctly validated")


}


module.exports = validateEnv