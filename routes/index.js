import express from 'express';
import transactionRoutes from './transaction.js';

const router = express.Router();

// API version 1 routes
router.use('/', transactionRoutes);

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: 'Transaction Status Checker API',
    version: '1.0.0',
    endpoints: {
      verify: 'POST /api/verify',
      getTransaction: 'GET /api/transaction/:id',
      stats: 'GET /api/stats',
      health: 'GET /api/health'
    }
  });
});

export default router;