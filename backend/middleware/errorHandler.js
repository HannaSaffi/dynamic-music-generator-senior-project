const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Error:', err);

  if (err.name === 'CastError') {
    return errorResponse(res, 404, 'Resource not found');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 400, `${field} already exists`);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return errorResponse(res, 400, message);
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
