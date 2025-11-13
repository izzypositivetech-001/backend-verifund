import { connectDB } from '../src/config/db.js';
import transactionService from '../src/services/transaction.service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { transactionId } = req.body;
    const result = await transactionService.verifyTransaction(transactionId);
    
    res.status(200).json({
      success: true,
      message: "Transaction verified successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}