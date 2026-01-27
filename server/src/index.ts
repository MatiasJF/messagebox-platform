/**
 * Main server file for the MessageBox Certifier Platform
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { CertificationStorage } from './storage/CertificationStorage.js'
import { WalletSessionManager } from './wallet/WalletSessionManager.js'
import { createCertifyRouter } from './routes/certify.js'
import { createListCertifiedRouter } from './routes/listCertified.js'
import { createPaymentRouter } from './routes/payment.js'
import { createStoreCertificationRouter } from './routes/storeCertification.js'
import { createWalletSessionRouter } from './routes/walletSession.js'

// Load environment variables
dotenv.config({ path: '../.env' })

const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const MONGO_DB = process.env.MONGO_DB || 'messagebox_certifier'
const MESSAGEBOX_HOST = process.env.MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Initialize storage
const storage = new CertificationStorage(MONGO_URI, MONGO_DB)

// Initialize wallet session manager
const walletSessionManager = new WalletSessionManager()

// Connect to MongoDB
await storage.connect()

// Register routes
app.use('/api', createWalletSessionRouter(walletSessionManager))
app.use('/api', createCertifyRouter(storage, MESSAGEBOX_HOST, walletSessionManager))
app.use('/api', createListCertifiedRouter(storage))
app.use('/api', createPaymentRouter(storage, MESSAGEBOX_HOST, walletSessionManager))
app.use('/api', createStoreCertificationRouter(storage))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MessageBox Certifier Platform API',
    version: '1.0.0',
    endpoints: {
      certify: 'POST /api/certify',
      listCertified: 'GET /api/certified-users',
      searchCertified: 'GET /api/certified-users/search?q=query',
      initiatePayment: 'POST /api/initiate-payment',
      health: 'GET /health'
    }
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   MessageBox Certifier Platform API                        ║
║                                                           ║
║   Server running on: http://localhost:${PORT}             ║
║   MessageBox Host: ${MESSAGEBOX_HOST.padEnd(35)}          ║
║   MongoDB: ${MONGO_DB.padEnd(47)}                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(async () => {
    await storage.disconnect()
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...')
  server.close(async () => {
    await storage.disconnect()
    console.log('Server closed')
    process.exit(0)
  })
})
