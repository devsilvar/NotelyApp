const Joi = require("joi")


const registerSchema = Joi.object({
   body: Joi.object({
    firstName: Joi.string().required(),
    lastName:Joi.string().required(),
    email:Joi.string().required(),
    role:Joi.string().required(),
    password:Joi.string().required()
   }),
   query:Joi.object(),
   params:Joi.object()
})




const loginSchema = Joi.object({
   body: Joi.object({
    email:Joi.string().required(),
    password:Joi.string().required()
   }),
   query:Joi.object(),
   params:Joi.object()
})

// req.body
// req.query
// req.params

const changePasswordSchema = Joi.object({
    body:Joi.object({
        oldPassword : Joi.string().min(6).required().messages({"string.min" : "Password should not be less than 6 characters"}),
        newPassword: Joi.string().min(6).required().messages({"string.min": "Password should not be less than 6 characters"})
    }),
    params: Joi.object(),
    query: Joi.object()
})



const forgetPasswordSchema = Joi.object({
    body:Joi.object({
        email:Joi.string().required()
    }),
    params:Joi.object(),
    query:Joi.object()
})


const verifyforgetPasswordCodeSchema = Joi.object({
    body:Joi.object({
        email:Joi.string().required(),
        newPassword:Joi.string().required(),
        validationCode:Joi.string().required()
    }),
    params:Joi.object(),
    query:Joi.object()
})




module.exports = {loginSchema , registerSchema , changePasswordSchema , forgetPasswordSchema ,verifyforgetPasswordCodeSchema}