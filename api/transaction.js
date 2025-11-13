import { connectDB } from '../config/db.js';
import transactionService from '../services/transaction.js';
import validationService from '../services/validation.js';
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

    // Extract transaction ID from URL path
    // URL format: /api/transaction/[id]
    const { id } = req.query;

    // Validate transaction ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Validate transaction ID format
    try {
      validationService.validateTransactionId(id);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Get transaction from service
    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    });

  } catch (error) {
    logger.error('Transaction API error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the transaction. Please try again later.'
    });
  }
}
