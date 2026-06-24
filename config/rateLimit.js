const rateLimit =  require("express-rate-limit")
const {ipKeyGenerator} = rateLimit
// DRY
//helper message to spit out errors --responses form our rate limits function


const buildMessage = (message) =>({
    status: "error",
    statusCode : 429,
    message,
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:100,
    message:buildMessage("Too many request, Try again after 15 minutes"),
    standardHeaders: true,
     legacyHeaders:false,
})

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:5,
    message:buildMessage("Too many login attempts , your Ip has been blocked for 15 minutes"),
    standardHeaders: true,
     legacyHeaders:false,
     handler:(req, res, next, options) =>{
        console.warn(`RATE LIMIT Login has been blocked: IP=${req.ip} Time=${new Date().toISOString()}`)
        res.status(429).json(options.message)
     }
})


const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:buildMessage("Too many login attempts , your Ip has been blocked for 15 minutes"),
    standardHeaders: true,
     legacyHeaders:false,
     handler:(req, res, next, options) =>{
        console.warn(`RATE LIMIT signup has been blocked: IP=${req.ip} Time=${new Date().toISOString()}`)
        res.status(429).json(options.message)
     }
})


const addNoteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message:buildMessage("Too attempts at creating a note, try again in 15 minutes"),
    standardHeaders: true,
     legacyHeaders:false,
     keyGenerator: (req) =>{
        //rate limit based on teh user id
        const status = req.user ? req.user.userId.toString() : ipKeyGenerator(req.ip) 
     }
})


module.exports = {
    loginLimiter, registerLimiter, addNoteLimiter , apiLimiter,
}