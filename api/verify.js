import { connectDB } from '../config/db.js';
import { transactionService } from '../services/transaction.js';
import { validationService } from '../services/validation.js';
import logger from '../utils/logger.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId is required'
      });
    }

    const validation = await validationService.validateTransaction(transactionId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const result = await transactionService.verifyTransaction(transactionId);

    return res.status(200).json({
      success: true,
      message: 'Transaction verified',
      data: result
    });
  } catch (error) {
    logger.error('Verify transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};
