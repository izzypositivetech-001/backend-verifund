# Transaction Status Checker - Backend API

## 🎥 Project Demo

[![Watch the demo](https://img.youtube.com/vi/d2WbnjZvZKk?si=XW0RY5hQK02BH34b/maxresdefault.jpg)](https://youtu.be/d2WbnjZvZKk?si=XW0RY5hQK02BH34b)

You can also watch it here → [Demo Video](https://youtu.be/d2WbnjZvZKk?si=XW0RY5hQK02BH34b)

---

### 🚀 How It Works
Our Express.js backend powers the core logic for the project — handling authentication, data validation, and API integrations.  


A robust MERN stack backend for verifying Nigerian bank transaction statuses with NIBSS/Bank API integration capabilities.

##  Features

- **Transaction Verification** - Verify transaction IDs against banking systems
- **Smart Caching** - Reduces redundant API calls with intelligent caching
- **Status Tracking** - Monitor successful, pending, failed, and fake transactions
- **Multi-Bank Support** - Supports all major Nigerian banks
- **Security** - Rate limiting, helmet, CORS, input validation
- **Audit Trail** - Complete verification history for each transaction
- **Mock/Real/Hybrid Modes** - Test with mocks, deploy with real APIs
- **High Performance** - Optimized with caching and database indexing

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0 (local or Atlas)
- **Git**

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/transaction-checker-backend.git
cd transaction-checker-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/transaction-checker
VERIFICATION_MODE=mock
CORS_ORIGIN=http://localhost:3000
```

### 4. Create logs directory

```bash
mkdir logs
```

### 5. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run at: `http://localhost:4000`

---

## 🗄️ Database Setup

### Local MongoDB

1. Install MongoDB: https://www.mongodb.com/docs/manual/installation/
2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/transaction-checker
   ```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:4000/api
```

### 1. **Verify Transaction**

**POST** `/api/verify`

Verify a transaction ID and get its status.

**Request Body:**
```json
{
  "transactionId": "001ABCD1234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": {
    "transactionId": "001ABCD1234567",
    "status": "successful",
    "sourceBank": "UBA",
    "destinationBank": "GTB",
    "amount": 25000,
    "lastChecked": "2025-11-12T10:30:00.000Z",
    "checkCount": 1,
    "cached": false,
    "verificationHistory": [
      {
        "status": "successful",
        "timestamp": "2025-11-12T10:30:00.000Z",
        "source": "initial_check"
      }
    ]
  },
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Status Values:**
- `successful` - Transaction completed
- `pending` - Transaction processing
- `failed` - Transaction failed
- `fake` - Transaction ID not found

---

### 2. **Get Transaction Details**

**GET** `/api/transaction/:id`

Retrieve cached transaction details.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "transactionId": "001ABCD1234567",
    "status": "successful",
    "sourceBank": "UBA",
    "destinationBank": "GTB",
    "amount": 25000,
    "lastChecked": "2025-11-12T10:30:00.000Z",
    "checkCount": 2,
    "cached": false
  }
}
```

---

### 3. **Get Statistics**

**GET** `/api/stats`

Get verification statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 150,
    "byStatus": [
      {
        "_id": "successful",
        "count": 105,
        "totalAmount": 5250000
      },
      {
        "_id": "pending",
        "count": 25,
        "totalAmount": 750000
      },
      {
        "_id": "failed",
        "count": 15,
        "totalAmount": 450000
      },
      {
        "_id": "fake",
        "count": 5,
        "totalAmount": 0
      }
    ],
    "cacheStats": {
      "size": 45,
      "entries": ["001ABCD1234567", "002XYZ9876543"]
    }
  }
}
```

---

### 4. **Health Check**

**GET** `/api/health`

Check if the service is running.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "uptime": 3600
  }
}
```

---

## Testing with cURL

### Verify a transaction
```bash
curl -X POST http://localhost:4000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"001ABCD1234567"}'
```

### Get transaction details
```bash
curl http://localhost:4000/api/transaction/001ABCD1234567
```

### Get statistics
```bash
curl http://localhost:4000/api/stats
```

### Health check
```bash
curl http://localhost:4000/api/health
```

---

## Verification Modes

### 1. **Mock Mode** (Default)

Perfect for development and testing.

```env
VERIFICATION_MODE=mock
```

**Behavior:**
- IDs starting with `9` or containing `FAKE` → `fake`
- IDs starting with `P` → `pending`
- IDs starting with `F` → `failed`
- Others → 70% successful, 15% pending, 10% failed, 5% fake

### 2. **Real Mode**

Connects to actual NIBSS/Bank APIs.

```env
VERIFICATION_MODE=real
NIBSS_API_KEY=your_actual_api_key
NIBSS_BASE_URL=https://api.nibss.com/v1
```

### 3. **Hybrid Mode**

Uses real APIs with mock fallback.

```env
VERIFICATION_MODE=hybrid
```

---

## Security Features

### Rate Limiting

Default: 100 requests per 15 minutes per IP

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS Protection

Configure allowed origins:

```env
CORS_ORIGIN=http://localhost:3000,https://yourapp.com
```

### Input Validation

- Transaction IDs must be 10-20 alphanumeric characters
- All inputs are sanitized
- Request body size limited to 10MB

---

## Logging

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/all.log` - All logs
- Console - In development mode

**Log Levels:**
- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `http` - HTTP requests
- `debug` - Detailed debugging info

---

## 🚀 Deployment

### Deploy to Render

1. Create account at vercel
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in Render dashboard
6. Deploy!

### Deploy to Railway

1. Create account at https://railway.app
2. Create new project
3. Add MongoDB service
4. Add Node.js service
5. Connect GitHub repository
6. Configure environment variables
7. Deploy!

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_production_mongodb_uri
NIBSS_API_KEY=your_production_api_key
VERIFICATION_MODE=real
CORS_ORIGIN=https://yourfrontend.com
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── constants.js       # Bank codes, status enums
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment config
│   ├── controllers/
│   │   └── transaction.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── models/
│   │   └── transaction.model.js
│   ├── routes/
│   │   ├── index.js
│   │   └── transaction.routes.js
│   ├── services/
│   │   ├── bank.service.js
│   │   ├── cache.service.js
│   │   ├── nibss.service.js
│   │   ├── transaction.service.js
│   │   └── validation.service.js
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── logger.js
│   │   └── response.js
│   ├── app.js
│   └── server.js
├── logs/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check username/password in connection string
- Ensure user has correct database permissions
- For Atlas: Check network access (whitelist IP)

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Test coverage
```bash
npm test -- --coverage
```

---

## Scripts

| Script | Description |

| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

---

##  Configuration

### Cache TTL

Configure how long transactions are cached:

```env
CACHE_TTL_HOURS=24  # 24 hours for completed transactions
```

Pending transactions are cached for 5 minutes by default.

### NIBSS Timeout

Configure API timeout:

```env
NIBSS_TIMEOUT=5000  # 5 seconds
```

---

## Performance Tips

1. **Use MongoDB Indexes** - Already configured in model
2. **Enable Compression** - Already enabled in app.js
3. **Use Redis for Caching** - Add Redis URL to .env
4. **Monitor Logs** - Check logs/ directory regularly
5. **Scale Horizontally** - Deploy multiple instances behind load balancer

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

- **Issues:** https://github.com/yourusername/transaction-checker-backend/issues
- **Email:** support@yourapp.com
- **Documentation:** https://docs.yourapp.com

---

## Future Enhancements

- [ ] Add Redis caching layer
- [ ] Implement API key authentication
- [ ] Add Swagger/OpenAPI documentation
- [ ] Webhook support for status updates
- [ ] Admin dashboard
- [ ] Real-time notifications via WebSocket
- [ ] Export verification reports (PDF, Excel)
- [ ] Multi-tenant support
- [ ] Advanced fraud detection algorithms

---