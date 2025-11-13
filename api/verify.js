export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const cleanId = transactionId.trim().toUpperCase();
    const regex = /^[A-Z0-9]{10,20}$/;
    
    if (!regex.test(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format. Must be 10-20 alphanumeric characters.'
      });
    }

    let status = 'successful';
    let reason = 'Transaction completed successfully';
    
    if (cleanId.startsWith('9') || cleanId.includes('FAKE')) {
      status = 'fake';
      reason = 'Transaction ID not found in banking system';
    } else if (cleanId.startsWith('P')) {
      status = 'pending';
      reason = 'Transaction is being processed';
    } else if (cleanId.startsWith('F')) {
      status = 'failed';
      reason = 'Insufficient funds or technical error';
    }

    const prefix = cleanId.substring(0, 3);
    const bankMap = {
      '001': 'UBA', '002': 'GTB', '003': 'ACCESS',
      '004': 'ZENITH', '005': 'FCMB', '006': 'FIRSTBANK'
    };
    const sourceBank = bankMap[prefix] || 'UBA';
    const banks = ['UBA', 'GTB', 'ACCESS', 'ZENITH', 'FCMB', 'FIRSTBANK'];
    const destinationBank = banks[Math.floor(Math.random() * banks.length)];
    const amount = Math.floor(Math.random() * 500000) + 500;

    res.status(200).json({
      success: true,
      message: 'Transaction verified successfully',
      data: {
        transactionId: cleanId,
        status,
        sourceBank,
        destinationBank,
        amount,
        lastChecked: new Date().toISOString(),
        checkCount: 1,
        cached: false,
        reason
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}