const jwt = require('jsonwebtoken');
const secretKey = require('../config').jwtSecretKey;

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secretKey);
  } catch (error) {
    error.message = 'Unauthorized';
    error.statusCode = 401;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
}