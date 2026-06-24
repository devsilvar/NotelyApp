const mongoose = require("mongoose")


const connectDB = async function(retries=5 , delay=5000){
  for(let attempt = 1 ; attempt <= retries ; attempt++){

  
    try{
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS:30000,
        socketTimeoutMS:65000,
    })

    console.log(`database Connected : ${conn.connection.host}`)
return;    
}catch(err){
        console.log(`MongoDB Connection Error : ${err.message}`)

        if(attempt == retries){
            console.log(`connection failed shutting down`)
            process.exit(1)
        }
    }

    }
}

mongoose.connection.on("connected" ,()=>{
    console.log("MongoDB Connected")
})

mongoose.connection.on("error", (err)=>{
    console.log("MongoDB Error" , err.message)
})

mongoose.connection.on("disconnected" , ()=>{
    console.log("MongoDB Disconnected")
})

module.exports = connectDB