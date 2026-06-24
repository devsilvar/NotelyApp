

const validate = (schema) =>{
    return (req, res, next) =>{

    const data = {
    body:req.body,
    params: req.params,
    query:req.query,
  }

  const {error} = schema.validate(data , {
    abortEarly: true
  });

  if(error){
    return res.status(400).json({
        message: "Error",
        errors: error.details.map(err => err.message)
    })
  };

  next() 
  }
}

module.exports = validate
