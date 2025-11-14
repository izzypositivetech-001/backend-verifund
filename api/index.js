import { connectDB } from '../config/db.js';
import { recordToBlockchain, getBlockchainData } from '../services/blockchain.js';
import { transactionService } from '../services/transaction.js';
import { validationService } from '../services/validation.js';
import logger from '../utils/logger.js';

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async (req, res) => {
  // Apply CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.split('?')[0] || '/';
  
  try {
    // Health check
    if (path === '/api/health' && req.method === 'GET') {
      return handleHealth(req, res);
    }

    // Verify transaction
    if (path === '/api/verify' && req.method === 'POST') {
      return await handleVerify(req, res);
    }

    // Blockchain endpoints
    if (path === '/api/blockchain') {
      if (req.method === 'POST') {
        return await handleRecordBlockchain(req, res);
      } else if (req.method === 'GET') {
        return await handleGetBlockchainData(req, res);
      }
    }

    // Transaction details
    if (path.startsWith('/api/transaction/') && req.method === 'GET') {
      return await handleGetTransaction(req, res);
    }

    // Stats
    if (path === '/api/stats' && req.method === 'GET') {
      return await handleStats(req, res);
    }

    // Root API
    if (path === '/api' || path === '/') {
      return res.status(200).json({
        message: 'Transaction Status Checker API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/health',
          verify: 'POST /api/verify',
          blockchain: 'GET|POST /api/blockchain',
          transaction: 'GET /api/transaction/[id]',
          stats: 'GET /api/stats'
        },
        status: 'API is running'
      });
    }

    // Not found
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });

  } catch (error) {
    logger.error('API Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Handler functions
async function handleHealth(req, res) {
  try {
    const db = await connectDB();
    const isConnected = db?.connection?.readyState === 1;

    return res.status(200).json({
      success: true,
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('Health check error:', error);
    return res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
}

async function handleVerify(req, res) {
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
}

async function handleRecordBlockchain(req, res) {
  try {
    const { transactionId, amount, status } = req.body;

    if (!transactionId || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionId, amount, status'
      });
    }

    const result = await recordToBlockchain({
      transactionId,
      amount,
      status
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction recorded on blockchain',
      data: result
    });
  } catch (error) {
    logger.error('Blockchain record error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record on blockchain',
      error: error.message
    });
  }
}

async function handleGetBlockchainData(req, res) {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing transactionId query parameter'
      });
    }

    const data = await getBlockchainData(transactionId);

    return res.status(200).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    logger.error('Blockchain fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blockchain data',
      error: error.message
    });
  }
}

async function handleGetTransaction(req, res) {
  try {
    await connectDB();
    const transactionId = req.url.split('/').pop();

    const transaction = await transactionService.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error('Get transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
}

async function handleStats(req, res) {
  try {
    await connectDB();
    const stats = await transactionService.getStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
}
