import { connectDB } from '../config/db.js';
import logger from '../utils/logger.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200);
    return res.end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    const isConnected = db?.connection?.readyState === 1;

    return res.status(200).json({
      success: true,
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      mongoUri: process.env.MONGO_URI ? 'configured' : 'missing'
    });
  } catch (error) {
    logger.error('Health check error:', error);
    return res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
