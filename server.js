import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';

const PORT = config.port || 3000;
const MONGO_URI = config.mongoUri;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} | env=${config.env} | mode=${config.verificationMode}`);
    });
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
