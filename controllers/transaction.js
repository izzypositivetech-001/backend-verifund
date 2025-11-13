import transactionService from '../services/transaction.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ValidationError, NotFoundError } from '../utils/apiError.js';
import logger from '../utils/logger.js';

class TransactionController {
  /**
   * POST /api/verify - Verify a transaction
   */
  async verifyTransaction(req, res, next) {
    try {
      const { transactionId } = req.body;

      // Extract metadata
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };

      logger.info(`Verification request for: ${transactionId}`);

      const result = await transactionService.verifyTransaction(
        transactionId,
        metadata
      );

      return successResponse(
        res,
        result,
        'Transaction verified successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transaction/:id - Get transaction details
   */
  async getTransaction(req, res, next) {
    try {
      const { id } = req.params;

      logger.info(`Get transaction request for: ${id}`);

      const transaction = await transactionService.getTransaction(id);

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      return successResponse(
        res,
        transaction,
        'Transaction retrieved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/stats - Get verification statistics
   */
  async getStats(req, res, next) {
    try {
      logger.info('Stats request received');

      const stats = await transactionService.getStats();

      return successResponse(
        res,
        stats,
        'Statistics retrieved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/health - Health check endpoint
   */
  async healthCheck(req, res) {
    return successResponse(
      res,
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      'Service is healthy'
    );
  }
}

export default new TransactionController();