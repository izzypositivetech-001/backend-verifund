import { connectDB } from '../config/db.js';
import transactionService from '../services/transaction.js';
import logger from '../utils/logger.js';

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
};

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only GET method allowed
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only GET is supported.'
    });
  }

  try {
    // Connect to database
    await connectDB();

    // Get statistics from service
    const stats = await transactionService.getStats();

    return res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Stats API error:', error);

    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving statistics. Please try again later.'
    });
  }
}
