const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User not found.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    next(err);
  }
};

module.exports = auth;
