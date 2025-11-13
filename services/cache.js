import { CACHE_CONFIG } from '../config/constants.js';
import logger from '../utils/logger.js';

class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached transaction
   */
  async get(transactionId) {
    const cached = this.cache.get(transactionId); 
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (cached.expiresAt && cached.expiresAt < Date.now()) {
      this.cache.delete(transactionId);
      logger.debug(`Cache expired for transaction: ${transactionId}`);
      return null;
    }

    logger.debug(`Cache hit for transaction: ${transactionId}`);
    return cached.data;
  }

  /**
   * Set cache with TTL
   */
  async set(transactionId, data, ttlMinutes = null) {
    const ttl = ttlMinutes 
      ? ttlMinutes * 60 * 1000 
      : CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000;
    
    const expiresAt = Date.now() + ttl;

    this.cache.set(transactionId, {
      data,
      expiresAt
    });

    logger.debug(`Cached transaction: ${transactionId} (TTL: ${ttl}ms)`);
  }

  /**
   * Delete from cache
   */
  async delete(transactionId) {
    const deleted = this.cache.delete(transactionId);
    if (deleted) {
      logger.debug(`Deleted from cache: ${transactionId}`);
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  async clear() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default new CacheService();