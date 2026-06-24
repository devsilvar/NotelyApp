


const errorHandler = (err , req, res, next) =>{

    //default errors without any status code to 500
    let statusCode = 500;
    let message = err.message || "Somerr.statusCode || thing went wrong on our end" ;
      
    //api/notes/8193782avdvudbv
     if(err.name === "CastError"){
      statusCode = 400
      message = `Invalid ${err.path}:  ${err.value}`
     } 

     ///duplicate unique field
     if(err.code === 11000){
       statusCode = 400
       const field = Object.keys(err.keyValud ||  {field: ""})[0]
       message = `An account with that ${field} already exists`
     }

     if(err.name === "ValidationError"){
        statusCode = 400
        message = Object.values(err.error).map(item => item.message).join(". ") ;
     }
      if(err.statusCode  >= 500){
          console.log(`Error` , err)
      }

      res.status(statusCode).json({
        status: statusCode >= 400 &&  statusCode < 500 ? "fail" : "error",
        message,
      })
    
    }

    module.exports = errorHandler