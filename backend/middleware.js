// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    data: null
  };

  // Specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.data = err.details;
  } else if (err.name === 'NotFoundError') {
    error.message = 'Resource not found';
  } else if (err.message) {
    error.message = err.message;
  }

  res.status(err.status || 500).json(error);
};

// Success response helper
const successResponse = (res, data, message = 'Success') => {
  res.json({
    success: true,
    message,
    data
  });
};

// Error response helper
const errorResponse = (res, message, status = 400, data = null) => {
  res.status(status).json({
    success: false,
    message,
    data
  });
};

module.exports = {
  errorHandler,
  successResponse,
  errorResponse
};