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

// JWT Authentication middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  errorHandler,
  successResponse,
  errorResponse,
  authenticateToken,
  isAdmin
};