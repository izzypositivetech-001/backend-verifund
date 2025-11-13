import { connectDB } from '../config/db.js';
import logger from '../utils/logger.js';

export default async function handler(req, res) {
  // Set response headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Try to connect to database
    await connectDB();

    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    // Still return 200 but indicate degraded status
    res.status(200).json({
      success: true,
      message: 'Service is running but degraded',
      data: {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error.message
      }
    });
  }
}