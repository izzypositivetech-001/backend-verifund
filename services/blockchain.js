import fetch from 'node-fetch';
import { config } from '../config/env.js';

const BLOCKCHAIN_API = config.blockchainApi || 'https://verified-block-mock.onrender.com';

export const recordToBlockchain = async (data) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_API}/blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: data.transactionId,
        amount: data.amount,
        status: data.status,
      }),
    });

    if (!response.ok) {
      throw new Error(`Blockchain API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Blockchain recording error:', error.message);
    throw error;
  }
};

export const getBlockchainData = async (transactionId) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_API}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionID: transactionId }),
    });

    if (!response.ok) {
      console.warn('Blockchain API returned:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Blockchain data fetch error:', error.message);
    return null;
  }
};
