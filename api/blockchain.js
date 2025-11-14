import { recordToBlockchain, getBlockchainData } from '../services/blockchain.js';

export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200);
    return res.end();
  }

  if (req.method === 'POST') {
    try {
      const { transactionId, amount, status } = req.body;

      if (!transactionId || !amount || !status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: transactionId, amount, status',
        });
      }

      const result = await recordToBlockchain({
        transactionId,
        amount,
        status,
      });

      return res.status(200).json({
        success: true,
        message: 'Transaction recorded on blockchain',
        data: result,
      });
    } catch (error) {
      console.error('Blockchain record error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to record on blockchain',
        error: error.message,
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { transactionId } = req.query;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Missing transactionId query parameter',
        });
      }

      const data = await getBlockchainData(transactionId);

      return res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (error) {
      console.error('Blockchain fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch blockchain data',
        error: error.message,
      });
    }
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
};
