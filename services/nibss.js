import { config } from '../config/env.js';
import { TRANSACTION_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

class NIBSSService {
  constructor() {
    this.apiKey = config.nibss.apiKey;
    this.baseUrl = config.nibss.baseUrl;
    this.timeout = config.nibss.timeout;
  }

  /**
   * Verify transaction with NIBSS API
   */
  async verifyTransaction(transactionId) {
    try {
      logger.info(`NIBSS verification for: ${transactionId}`);

      // Real NIBSS API call (when available)
      if (this.apiKey && config.verificationMode === 'real') {
        return await this.callRealNIBSSAPI(transactionId);
      }

      // Mock verification for development
      return await this.mockVerification(transactionId);

    } catch (error) {
      logger.error('NIBSS verification error:', error);
      throw error;
    }
  }

  /**
   * Real NIBSS API call
   */
  async callRealNIBSSAPI(transactionId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/transactions/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NIBSS API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        status: this.mapNIBSSStatus(data.status),
        sourceBank: data.sourceBank,
        destinationBank: data.destinationBank,
        amount: data.amount,
        reason: data.message || 'Transaction verified'
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        logger.error('NIBSS API timeout');
      }
      throw error;
    }
  }

  /**
   * Mock verification logic (for development)
   */
  async mockVerification(transactionId) {
    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    // Fake transaction detection
    if (transactionId.startsWith('9') || transactionId.includes('FAKE')) {
      return {
        status: TRANSACTION_STATUS.FAKE,
        reason: 'Transaction ID not found in banking system'
      };
    }

    // Pending transactions
    if (transactionId.startsWith('P')) {
      return {
        status: TRANSACTION_STATUS.PENDING,
        reason: 'Transaction is being processed'
      };
    }

    // Failed transactions
    if (transactionId.startsWith('F')) {
      return {
        status: TRANSACTION_STATUS.FAILED,
        reason: 'Insufficient funds or technical error'
      };
    }

    // Random distribution for realistic testing
    const random = Math.random();
    if (random < 0.7) {
      return {
        status: TRANSACTION_STATUS.SUCCESSFUL,
        reason: 'Transaction completed successfully'
      };
    } else if (random < 0.85) {
      return {
        status: TRANSACTION_STATUS.PENDING,
        reason: 'Transaction processing'
      };
    } else if (random < 0.95) {
      return {
        status: TRANSACTION_STATUS.FAILED,
        reason: 'Transaction failed'
      };
    } else {
      return {
        status: TRANSACTION_STATUS.FAKE,
        reason: 'Invalid transaction'
      };
    }
  }

  /**
   * Map NIBSS status codes to our system
   */
  mapNIBSSStatus(nibssStatus) {
    const statusMap = {
      'SUCCESS': TRANSACTION_STATUS.SUCCESSFUL,
      'COMPLETED': TRANSACTION_STATUS.SUCCESSFUL,
      'PENDING': TRANSACTION_STATUS.PENDING,
      'PROCESSING': TRANSACTION_STATUS.PENDING,
      'FAILED': TRANSACTION_STATUS.FAILED,
      'REJECTED': TRANSACTION_STATUS.FAILED,
      'NOT_FOUND': TRANSACTION_STATUS.FAKE,
      'INVALID': TRANSACTION_STATUS.FAKE
    };

    return statusMap[nibssStatus] || TRANSACTION_STATUS.VERIFICATION_UNAVAILABLE;
  }

  /**
   * Check if NIBSS API is available
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return { available: false, reason: 'API key not configured' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      return {
        available: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        available: false,
        reason: error.message
      };
    }
  }
}

export default new NIBSSService();