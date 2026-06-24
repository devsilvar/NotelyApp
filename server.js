require('dotenv').config()
const express = require('express')
const connectDB = require("./config/db")
const userRoutes = require("./routes/user")
const noteRoutes = require("./routes/notes")
const errorHandler = require("./middleware/errorHandler")
const helmet = require("helmet")
const cors = require("cors")
const { apiLimiter } = require("./config/rateLimit")
const validateEnv = require("./config/validateEnv")

validateEnv()
const app = express()
const PORT = process.env.PORT || 5000
connectDB()



app.use(helmet())
app.use(cors({
    origin:process.env.CLIENT_URL || "*",
    methods: ["GET" , "PATCH" , "DELETE" , "POST"],
    allowedHeaders: ["Content-Type" , "Authorization"]
}))
app.get("/" , (req, res)=>{
    res.status(200).json({
        status: "sucesss",
        message: ' Notely Api is Working',
        version: "1.0.0"
    })
})


app.use(express.json())
app.use(express.urlencoded({extended:true , limit:'20kb'}))
app.use("/api/" , apiLimiter)


app.get("/health" , async(reaq, res, next)=>{
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"

 const healthData = {
    status: dbStatus === "connected" ? "healthy" :"unhealthy",
    timeStamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    enviroment : process.env.NODE_ENV,
    dataBase: dbStatus ,
    memory: {
        used: `${Math.round(process.memoryUsage()).heapUsed / 1024 / 1024} MB`,
        total: `${Math.round(process.memoryUsage()).heapTotal / 1024 / 1024} MB`
    }
 }

 const statusCode = healthData.status  === 'healthy' ? 200
 : 500
res.statusCode(statusCode).json(healthData)
}
)

app.use("/api/auth" , userRoutes)
app.use("/api/note" , noteRoutes)

app.use(errorHandler)

app.listen(PORT , ()=>{
    console.log(`server is running on :${PORT}`)
})












