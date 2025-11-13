export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString()
    }
  });
}