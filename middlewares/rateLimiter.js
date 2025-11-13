import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

export const verificationLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many verification requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Rate limit exceeded. Please try again later.',
      429
    );
  }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});