const jwt = require('jsonwebtoken');
const Unauthorized = require('../Errors/Unauthorized');
const User = require('../models/User');
require('dotenv').config();



const authMiddleware = async (req, res, next ) => {
    const token = req.cookies.token;
    if(!token) {
      throw new Unauthorized('Unauthorized')
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userExist = await User.findOne({_id:decoded.userId})
      req.userId = userExist._id;
      next();
    } catch(error) {
      throw new Unauthorized('Unauthorized')
    }
  }


module.exports = authMiddleware;
