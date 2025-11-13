import Transaction from '../models/transaction.js';
import validationService from '../services/validation.js';
import cacheService from '../services/cache.js';
import nibssService from '../services/nibss.js';
import bankService from '../services/bank.js';
import { CACHE_CONFIG, TRANSACTION_STATUS } from '../config/constants.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

class TransactionService {
  /**
   * Main verification method
   */
  async verifyTransaction(transactionId, metadata = {}) {
    try {
      // Validate transaction ID
      const validatedId = validationService.validateTransactionId(transactionId);

      // Check cache first
      const cachedTransaction = await this.checkCache(validatedId);
      if (cachedTransaction) {
        return cachedTransaction;
      }

      // Check database
      const dbTransaction = await this.checkDatabase(validatedId);
      if (dbTransaction) {
        return dbTransaction;
      }

      // Perform new verification
      const verificationResult = await this.performVerification(validatedId);

      // Save to database
      const transaction = await this.saveTransaction(
        validatedId,
        verificationResult,
        metadata
      );

      // Cache the result
      await this.cacheTransaction(transaction);

      return this.formatTransactionResponse(transaction, false);

    } catch (error) {
      logger.error('Transaction verification error:', error);
      throw error;
    }
  }

  /**
   * Check cache for existing transaction
   */
  async checkCache(transactionId) {
    const cached = await cacheService.get(transactionId);
    
    if (cached) {
      logger.info(`Cache hit for transaction: ${transactionId}`);
      return this.formatTransactionResponse(cached, true);
    }

    return null;
  }

  /**
   * Check database for existing transaction
   */
  async checkDatabase(transactionId) {
    const transaction = await Transaction.findByTransactionId(transactionId);

    if (!transaction) {
      return null;
    }

    // Check if cache is stale (for pending transactions)
    if (transaction.status === TRANSACTION_STATUS.PENDING) {
      const staleMinutes = CACHE_CONFIG.TTL_PENDING_MINUTES;
      const isStale = transaction.isStale(staleMinutes / 60);

      if (isStale) {
        logger.info(`Pending transaction is stale, re-verifying: ${transactionId}`);
        return null; // Force re-verification
      }
    }

    // Update last checked and count
    transaction.lastChecked = new Date();
    transaction.checkCount += 1;
    await transaction.save();

    // Cache it
    await this.cacheTransaction(transaction);

    logger.info(`Database hit for transaction: ${transactionId}`);
    return this.formatTransactionResponse(transaction, true);
  }

  /**
   * Perform actual verification (NIBSS or Bank API)
   */
  async performVerification(transactionId) {
    logger.info(`Performing verification for: ${transactionId}`);

    try {
      // Try NIBSS first
      const nibssResult = await nibssService.verifyTransaction(transactionId);

      if (nibssResult.status !== TRANSACTION_STATUS.VERIFICATION_UNAVAILABLE) {
        return {
          status: nibssResult.status,
          sourceBank: validationService.extractBankFromId(transactionId),
          destinationBank: this.getRandomBank(),
          amount: this.generateAmount(),
          reason: nibssResult.reason
        };
      }

      // Fallback to bank-specific API
      const bankCode = validationService.extractBankFromId(transactionId);
      await bankService.verifyWithBank(transactionId, bankCode);

      // If we reach here, use NIBSS mock result
      return {
        status: nibssResult.status,
        sourceBank: bankCode,
        destinationBank: this.getRandomBank(),
        amount: this.generateAmount(),
        reason: nibssResult.reason || 'Verification completed'
      };

    } catch (error) {
      logger.error('Verification failed:', error);
      
      return {
        status: TRANSACTION_STATUS.VERIFICATION_UNAVAILABLE,
        sourceBank: validationService.extractBankFromId(transactionId),
        destinationBank: this.getRandomBank(),
        amount: 0,
        reason: 'Verification service temporarily unavailable'
      };
    }
  }

  /**
   * Save transaction to database with upsert to prevent duplicate key errors
   */
  async saveTransaction(transactionId, verificationResult, metadata) {
    const expiresAt = new Date(
      Date.now() + CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000
    );

    const transactionData = {
      transactionId,
      status: verificationResult.status,
      sourceBank: verificationResult.sourceBank,
      destinationBank: verificationResult.destinationBank,
      amount: verificationResult.amount,
      lastChecked: new Date(),
      expiresAt,
      metadata: {
        ...metadata,
        verificationMode: config.verificationMode
      }
    };

    // Use findByIdAndUpdate with upsert to prevent duplicate key errors
    // If transaction exists, update it; if not, create it
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId },
      {
        $set: transactionData,
        $inc: { checkCount: 1 },
        $push: {
          verificationHistory: {
            status: verificationResult.status,
            timestamp: new Date(),
            source: 'initial_check'
          }
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    logger.info(`Transaction saved/updated: ${transactionId}`);
    return transaction;
  }

  /**
   * Cache transaction
   */
  async cacheTransaction(transaction) {
    const ttlMinutes = transaction.status === TRANSACTION_STATUS.PENDING
      ? CACHE_CONFIG.TTL_PENDING_MINUTES
      : null;

    await cacheService.set(
      transaction.transactionId,
      transaction.toObject(),
      ttlMinutes
    );
  }

  /**
   * Get transaction by ID (for GET requests)
   */
  async getTransaction(transactionId) {
    const validatedId = validationService.validateTransactionId(transactionId);
    
    // Check cache first
    const cached = await cacheService.get(validatedId);
    if (cached) {
      return this.formatTransactionResponse(cached, true);
    }

    // Check database
    const transaction = await Transaction.findByTransactionId(validatedId);
    if (!transaction) {
      return null;
    }

    return this.formatTransactionResponse(transaction, false);
  }

  /**
   * Format transaction response
   */
  formatTransactionResponse(transaction, cached) {
    return {
      transactionId: transaction.transactionId,
      status: transaction.status,
      sourceBank: transaction.sourceBank,
      destinationBank: transaction.destinationBank,
      amount: transaction.amount,
      lastChecked: transaction.lastChecked,
      checkCount: transaction.checkCount,
      cached,
      verificationHistory: transaction.verificationHistory || []
    };
  }

  /**
   * Generate random amount (for mock data)
   */
  generateAmount() {
    return Math.floor(Math.random() * 500000) + 500;
  }

  /**
   * Get random bank
   */
  getRandomBank() {
    const banks = ['UBA', 'GTB', 'ACCESS', 'ZENITH', 'FCMB', 'FIRSTBANK'];
    return banks[Math.floor(Math.random() * banks.length)];
  }

  /**
   * Get verification statistics
   */
  async getStats() {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const total = await Transaction.countDocuments();

    return {
      total,
      byStatus: stats,
      cacheStats: cacheService.getStats()
    };
  }
}

export default new TransactionService();