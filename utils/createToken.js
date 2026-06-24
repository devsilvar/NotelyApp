const jwt = require('jsonwebtoken')


const createToken = (userId , role) =>{
  let token = jwt.sign({userId , role}, process.env.JWT_SECRET , {expiresIn : process.env.JWT_EXPIRES_IN})
  return token;
}

module.exports = createToken ;