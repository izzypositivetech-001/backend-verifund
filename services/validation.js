import { BANK_CODES } from '../config/constants.js';
import { ValidationError } from '../utils/apiError.js';
import { config } from '../config/env.js';

// -----------------------------------------------------------------------------
// Precompute prefix map for O(1) lookup
// -----------------------------------------------------------------------------
const PREFIX_MAP = Object.freeze(
  Object.fromEntries(
    Object.entries(BANK_CODES).map(([key, info]) => [info.prefix, key])
  )
);

// -----------------------------------------------------------------------------
// Validation Service
// -----------------------------------------------------------------------------
class ValidationService {

  validateTransactionId(transactionId) {
    if (!transactionId) {
      throw new ValidationError('Transaction ID is required');
    }

    const cleanId = transactionId.trim().toUpperCase();

    const regex = /^[A-Z0-9]{10,20}$/;
    if (!regex.test(cleanId)) {
      throw new ValidationError(
        'Invalid transaction ID format. Must be 10–20 alphanumeric characters.'
      );
    }

    return cleanId;
  }

   
  extractBankFromId(transactionId) {
    const prefix = transactionId.substring(0, 3);
    const bankCode = PREFIX_MAP[prefix];

    if (!bankCode) {
      // Allow fallback only in non-production modes
      if (config.env === 'development' || config.verificationMode === 'mock') {
        const bankKeys = Object.keys(BANK_CODES);
        return bankKeys[Math.floor(Math.random() * bankKeys.length)];
      }

      throw new ValidationError(`Unrecognized transaction ID prefix: ${prefix}`);
    }

    return bankCode;
  }

  validateVerificationRequest(body) {
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Invalid request body format.');
    }

    const { transactionId } = body;
    return this.validateTransactionId(transactionId);
  }
}

export default new ValidationService();
