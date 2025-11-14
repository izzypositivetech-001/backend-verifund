import { connectDB } from '../config/db.js';
import logger from '../utils/logger.js';

export default async function handler(req, res) {
  // Set response headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Check if required environment variables are set
    const requiredEnvVars = ['MONGO_URI'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        message: 'Missing required environment variables',
        missing: missingVars,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Try to connect to database
    await connectDB();

    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    // Return error with details
    res.status(503).json({
      success: false,
      message: 'Service is degraded',
      data: {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: 'disconnected'
      }
    });
  }
}