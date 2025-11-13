import { ApiError } from '../utils/apiError.js';
import { errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Handle known errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    // Mongoose cast error
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry';
  }

  // Don't expose error details in production
  if (config.env === 'production' && statusCode === 500) {
    message = 'Something went wrong';
  }

  return errorResponse(res, message, statusCode, errors);
};

// 404 handler
export const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    404
  );
};