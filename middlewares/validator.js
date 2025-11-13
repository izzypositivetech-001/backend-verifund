import { ValidationError } from '../utils/apiError.js';

export const validateVerifyRequest = (req, res, next) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    throw new ValidationError('Transaction ID is required');
  }

  if (typeof transactionId !== 'string') {
    throw new ValidationError('Transaction ID must be a string');
  }

  next();
};

export const validateTransactionIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Transaction ID parameter is required');
  }

  next();
};