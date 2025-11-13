import mongoose from 'mongoose';
import { config } from './env.js';
import logger from '../utils/logger.js';

let isConnected = false;
let connectionPromise = null;

/**
 * Connect to MongoDB with serverless support
 * Handles both traditional server and Vercel serverless environments
 */
export const connectDB = async () => {
  // If already connected, return immediately
  if (isConnected) {
    logger.info('Using existing database connection');
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const options = {
        maxPoolSize: config.env === 'production' ? 5 : 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority'
      };

      await mongoose.connect(config.mongoUri, options);
      
      isConnected = true;
      logger.info('MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        isConnected = false;
      });

      // Graceful shutdown for traditional server (not Vercel)
      if (process.env.VERCEL !== 'true') {
        process.on('SIGINT', async () => {
          try {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed due to app termination');
          } catch (err) {
            logger.error('Error closing MongoDB:', err);
          }
          process.exit(0);
        });
      }

      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      connectionPromise = null; // Reset so next call will retry
      
      // In development, exit. In production/serverless, let the function return with error
      if (config.env === 'development' && process.env.VERCEL !== 'true') {
        process.exit(1);
      }
      throw error;
    }
  })();

  return connectionPromise;
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
};