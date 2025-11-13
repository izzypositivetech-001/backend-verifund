import mongoose from 'mongoose';
import { TRANSACTION_STATUS } from '../config/constants.js';

const verificationHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['initial_check', 'recheck', 'webhook', 'manual'],
    default: 'initial_check'
  },
  metadata: {
    type: Map,
    of: String
  }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    required: true,
    index: true
  },
  sourceBank: {
    type: String,
    required: true
  },
  destinationBank: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  lastChecked: {
    type: Date,
    default: Date.now,
    index: true
  },
  checkCount: {
    type: Number,
    default: 1,
    min: 1
  },
  verificationHistory: [verificationHistorySchema],
  expiresAt: {
    type: Date,
    index: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    verificationMode: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ transactionId: 1, status: 1 });
transactionSchema.index({ lastChecked: -1 });

// TTL index for automatic deletion of old records
transactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
transactionSchema.methods.addVerificationHistory = function(status, source = 'recheck') {
  this.verificationHistory.push({
    status,
    timestamp: new Date(),
    source
  });
  this.status = status;
  this.lastChecked = new Date();
  this.checkCount += 1;
};

transactionSchema.methods.isStale = function(hours = 24) {
  const staleTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.lastChecked < staleTime;
};

// Statics
transactionSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId: transactionId.toUpperCase() });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;