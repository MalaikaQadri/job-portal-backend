require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  console.log(user)
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE
  });
};

module.exports = generateToken;











