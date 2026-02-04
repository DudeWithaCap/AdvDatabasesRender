const AppError = require('../utils/AppError');


const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // if mongoose fails
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
