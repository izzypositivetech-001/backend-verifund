import express from 'express';
import transactionController from '../controllers/transaction.js';
import { 
  validateVerifyRequest, 
  validateTransactionIdParam 
} from '../middlewares/validator.js';
import { verificationLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// POST /api/verify - Verify transaction
router.post(
  '/verify',
  verificationLimiter,
  validateVerifyRequest,
  transactionController.verifyTransaction.bind(transactionController)
);

// GET /api/transaction/:id - Get transaction by ID
router.get(
  '/transaction/:id',
  validateTransactionIdParam,
  transactionController.getTransaction.bind(transactionController)
);

// GET /api/stats - Get statistics
router.get(
  '/stats',
  transactionController.getStats.bind(transactionController)
);

// GET /api/health - Health check
router.get(
  '/health',
  transactionController.healthCheck.bind(transactionController)
);

export default router;