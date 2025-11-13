import { UnauthorizedError } from '../utils/apiError.js';
import logger from '../utils/logger.js';


 //API Key authentication middleware (for future use)

export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;

  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }

  // Validate API key (implement your logic here)
  // For now, we'll skip validation
  // TODO: Implement proper API key validation

  logger.debug('API key authenticated');
  next();
};

/**
 * Optional authentication - doesn't fail if no key provided
 */
export const optionalAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;

  if (apiKey) {
    // Validate and attach user info to request
    req.authenticated = true;
    // TODO: Add user/client identification
  } else {
    req.authenticated = false;
  }

  next();
};