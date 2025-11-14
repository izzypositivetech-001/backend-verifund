export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    message: 'Transaction Status Checker API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      verify: 'POST /api/verify',
      transaction: 'GET /api/transaction/[id]',
      stats: 'GET /api/stats'
    },
    status: 'API is running on Vercel'
  });
}
