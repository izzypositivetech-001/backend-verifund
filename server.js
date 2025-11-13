import cluster from 'cluster';
import os from 'os';
import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';

const PORT = config.port || 3000;
const MONGO_URI = config.mongoUri;

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info(' Connected to MongoDB');

    const server = app.listen(PORT, () => {
      logger.info(
        ` Server running on port ${PORT} | env=${config.env} | mode=${config.verificationMode}`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        process.exit(0);
      });

      // Force shutdown if not closed in 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections and uncaught exceptions
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

// Use Node.js cluster mode for performance
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Master process running. Spawning ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}
