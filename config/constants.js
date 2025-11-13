export const BANK_CODES = {
  UBA: {
    name: 'United Bank for Africa',
    code: '033',
    prefix: '001',
    speed: 'fast',
    apiEndpoint: process.env.UBA_API_URL
  },
  GTB: {
    name: 'Guaranty Trust Bank',
    code: '058',
    prefix: '002',
    speed: 'medium',
    apiEndpoint: process.env.GTB_API_URL
  },
  ACCESS: {
    name: 'Access Bank',
    code: '044',
    prefix: '003',
    speed: 'fast',
    apiEndpoint: process.env.ACCESS_API_URL
  },
  ZENITH: {
    name: 'Zenith Bank',
    code: '057',
    prefix: '004',
    speed: 'slow',
    apiEndpoint: process.env.ZENITH_API_URL
  },
  FCMB: {
    name: 'First City Monument Bank',
    code: '214',
    prefix: '005',
    speed: 'medium',
    apiEndpoint: process.env.FCMB_API_URL
  },
  FIRSTBANK: {
    name: 'First Bank of Nigeria',
    code: '011',
    prefix: '006',
    speed: 'slow',
    apiEndpoint: process.env.FIRSTBANK_API_URL
  }
};

export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'successful',
  PENDING: 'pending',
  FAILED: 'failed',
  FAKE: 'fake',
  VERIFICATION_UNAVAILABLE: 'verification_unavailable'
};

export const VERIFICATION_MODE = {
  MOCK: 'mock',
  REAL: 'real',
  HYBRID: 'hybrid'
};

export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const CACHE_CONFIG = {
  TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS) || 24,
  TTL_PENDING_MINUTES: 5
};