const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateQuestion = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Question ${value} already exist in the database.`;

  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // any error that comes fro out error class isOperational: known
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programing or unknown err: don't leak details to production
    // TODO: Use a better logging method
    console.error('Error', err);
    res.status(500).json({
      status: 'error',
      message: "Something wen't very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'fail';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      error = handleDuplicateQuestion(err);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }
    // TODO: Add more uncaught operational errors

    sendErrorProd(error, res);
  }
};

// TODO
/**
 * Define errors severity level
 * Email admin incase of severe error
 * JWT ERROR MSG: jwt malformed
 */
