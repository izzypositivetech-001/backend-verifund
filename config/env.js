import dotenv from 'dotenv';

dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === 'true';

const requiredEnvVars = ['MONGO_URI'];

// Validate required environment variables - but only throw in development
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    const errorMsg = `Missing required environment variable: ${varName}`;
    if (!isProduction && !isVercel) {
      throw new Error(errorMsg);
    } else {
      console.error(`⚠️  ${errorMsg}`);
    }
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  isVercel,
  port: parseInt(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI,
  
  // NIBSS Configuration
  nibss: {
    apiKey: process.env.NIBSS_API_KEY,
    baseUrl: process.env.NIBSS_BASE_URL || 'https://api.nibss.com/v1',
    timeout: parseInt(process.env.NIBSS_TIMEOUT) || 5000
  },
  
  // Verification Mode
  verificationMode: process.env.VERIFICATION_MODE || 'mock',
  
  // Cache Configuration
  cache: {
    ttlHours: parseInt(process.env.CACHE_TTL_HOURS) || 24,
    redisUrl: process.env.REDIS_URL
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000']
};

