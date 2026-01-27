# Whitelabel MessageBox Certifier Platform

A minimal two-page web application for certifying identities and initiating payments on the MessageBox network built on Bitcoin SV (BSV).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

This platform provides a whitelabel solution for:

1. **Identity Certification**: Users can certify their identity with the MessageBox network by creating a cryptographically signed advertisement on the BSV blockchain
2. **Payment Lookup**: Browse and search certified identities stored on the platform
3. **Payment Initiation**: Send Bitcoin payments to any certified identity using the PeerPay protocol

The system leverages the MessageBox ecosystem:
- `@bsv/message-box-client` for messaging and payment functionality
- SHIP overlay network for identity-to-host discovery
- MongoDB for local storage of certified users

## Features

### Page 1: Identity Certification
- Simple form to certify user identity
- Optional display name/alias
- Blockchain-backed certification via MessageBox `anointHost()`
- Confirmation with identity key and transaction ID
- Automatic registration on the BSV overlay network

### Page 2: Payment Interface
- List all certified users
- Search by display name
- Select recipient and specify payment amount
- Initiate P2P Bitcoin payments using PeerPayClient
- Payment confirmation

### Backend API
- RESTful API with Express.js
- MongoDB storage for certified users
- Integration with MessageBox SDK
- CORS-enabled for local development

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (HTML/CSS/JS)                  │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  index.html          │    │  payments.html       │      │
│  │  (Certification)     │    │  (Payment Interface) │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + TypeScript)            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routes                                            │    │
│  │  • POST /api/certify                               │    │
│  │  • GET  /api/certified-users                       │    │
│  │  • POST /api/initiate-payment                      │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                              │
│                              ▼                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MessageBox SDK Integration                        │    │
│  │  • MessageBoxClient (identity certification)       │    │
│  │  • PeerPayClient (payment initiation)              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Storage                          │
│  Collection: certified_users                                │
│  • identityKey (string, unique)                             │
│  • alias (string, optional)                                 │
│  • certificationDate (Date)                                 │
│  • certificationTxid (string)                               │
│  • host (string)                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BSV Blockchain & Overlay Network               │
│  • SHIP protocol for identity advertisement                 │
│  • MessageBox servers for message routing                   │
│  • Bitcoin SV for payment settlement                        │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v6 or higher)
  - Local installation: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud): [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (for cloning the repository)

### Optional but Recommended

- **MongoDB Compass** - GUI for MongoDB database management
- **Postman** or **curl** - For API testing

## Installation

### 1. Clone or Navigate to the Project

```bash
cd /Users/matiasjackson/Documents/Proyects/messagebox/whitelabel-certifier
```

### 2. Install Server Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Install Root Dependencies (Optional)

```bash
npm install
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MessageBox Configuration
MESSAGEBOX_HOST=https://messagebox.babbage.systems
BSV_NETWORK=mainnet

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB=messagebox_certifier
```

#### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the Express server | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MESSAGEBOX_HOST` | MessageBox server URL | `https://messagebox.babbage.systems` |
| `BSV_NETWORK` | Bitcoin SV network (mainnet/testnet/local) | `mainnet` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB` | MongoDB database name | `messagebox_certifier` |

### 2. MongoDB Setup

#### Option A: Local MongoDB

1. Start MongoDB:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Running the Application

### Development Mode

#### 1. Start MongoDB (if using local MongoDB)

```bash
# Ensure MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

#### 2. Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   MessageBox Certifier Platform API                      ║
║                                                           ║
║   Server running on: http://localhost:3000                ║
║   MessageBox Host: https://messagebox.babbage.systems     ║
║   MongoDB: messagebox_certifier                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

#### 3. Serve the Frontend (in a new terminal)

```bash
# From the project root
cd client
npx http-server public -p 3001
```

Or use any static file server:

```bash
# Using Python
cd client/public
python -m http.server 3001

# Using PHP
cd client/public
php -S localhost:3001
```

#### 4. Open the Application

Navigate to:
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

### Production Mode

#### 1. Build the Server

```bash
cd server
npm run build
```

#### 2. Start the Server

```bash
cd server
npm start
```

#### 3. Serve Frontend

In production, you would typically serve the frontend through a web server like Nginx or Apache, or deploy to a static hosting service.

## Usage

### Page 1: Identity Certification

1. Navigate to http://localhost:3001
2. (Optional) Enter a display name/alias
3. Click "Certify My Identity"
4. Wait for the blockchain transaction to complete
5. Your identity key and transaction ID will be displayed
6. The certification is now stored on the BSV blockchain and in the local database

**What happens behind the scenes:**
- A new BSV wallet is created for the user
- The identity key is extracted
- A PushDrop transaction is created containing [identityKey, host, signature]
- The transaction is broadcast to the BSV overlay network
- The certification is stored in MongoDB for quick lookup

### Page 2: Payment Interface

1. Navigate to http://localhost:3001/payments.html
2. Click "Show All" to load certified users
3. Browse the list of certified identities
4. Click "Select for Payment" on a user
5. Enter the amount in satoshis
6. Click "Send Payment"
7. Payment is sent via the MessageBox network

**What happens behind the scenes:**
- A payment token is created using BRC-29 key derivation
- The payment is sent to the recipient's MessageBox
- The recipient can accept or reject the payment using their PeerPayClient

### API Testing with curl

#### Certify an Identity

```bash
curl -X POST http://localhost:3000/api/certify \
  -H "Content-Type: application/json" \
  -d '{"alias": "John Doe"}'
```

Response:
```json
{
  "success": true,
  "identityKey": "0277a2b...",
  "txid": "abc123...",
  "alias": "John Doe",
  "message": "Identity successfully certified with the MessageBox network"
}
```

#### List Certified Users

```bash
curl http://localhost:3000/api/certified-users
```

Response:
```json
{
  "success": true,
  "users": [
    {
      "identityKey": "0277a2b...",
      "alias": "John Doe",
      "certificationDate": "2025-01-27T10:30:00.000Z",
      "host": "https://messagebox.babbage.systems"
    }
  ]
}
```

#### Initiate Payment

```bash
curl -X POST http://localhost:3000/api/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "0277a2b...",
    "amount": 50000
  }'
```

Response:
```json
{
  "success": true,
  "messageId": "Payment sent successfully"
}
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### POST /api/certify

Certify a new identity on the MessageBox network.

**Request Body:**
```json
{
  "alias": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "identityKey": "string",
  "txid": "string",
  "alias": "string",
  "message": "string"
}
```

#### GET /api/certified-users

List all certified users.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "identityKey": "string",
      "alias": "string",
      "certificationDate": "string (ISO 8601)",
      "host": "string"
    }
  ]
}
```

#### GET /api/certified-users/search?q={query}

Search certified users by alias.

**Query Parameters:**
- `q` (required): Search query string

**Response:**
```json
{
  "success": true,
  "users": [...]
}
```

#### POST /api/initiate-payment

Initiate a payment to a certified user.

**Request Body:**
```json
{
  "recipient": "string (identity key)",
  "amount": number (satoshis)
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "string"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "string"
}
```

## Project Structure

```
whitelabel-certifier/
├── README.md                          # This file
├── .env.example                       # Environment variables template
├── package.json                       # Root package.json
│
├── server/                            # Backend application
│   ├── package.json                   # Server dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── src/
│   │   ├── index.ts                   # Main server file
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── routes/
│   │   │   ├── certify.ts             # POST /api/certify
│   │   │   ├── listCertified.ts       # GET /api/certified-users
│   │   │   └── payment.ts             # POST /api/initiate-payment
│   │   └── storage/
│   │       └── CertificationStorage.ts # MongoDB layer
│   └── dist/                          # Compiled JavaScript (after build)
│
└── client/                            # Frontend application
    └── public/
        ├── index.html                 # Page 1: Certification
        ├── payments.html              # Page 2: Payments
        ├── styles.css                 # Styles
        └── app.js                     # Shared JavaScript
```

## Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongoServerError: connection refused`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```
2. Check the `MONGO_URI` in `.env`
3. For MongoDB Atlas, ensure your IP is whitelisted

### CORS Errors in Browser

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
The server already includes CORS middleware. Ensure:
1. Server is running on port 3000
2. Frontend is accessing `http://localhost:3000`
3. Check browser console for exact error

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
1. Kill the process using the port:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change the `PORT` in `.env`

### MessageBox SDK Errors

**Problem:** Errors related to `@bsv/message-box-client`

**Solution:**
1. Ensure you have a working internet connection (for overlay network)
2. Check that `MESSAGEBOX_HOST` is accessible
3. For local development, you may need to run a local MessageBox server

### Payment Failures

**Problem:** Payments fail or don't arrive

**Solution:**
1. Ensure the recipient has certified their identity
2. Check that both sender and recipient have sufficient BSV
3. Verify the MessageBox server is operational
4. In production, implement proper wallet management

## Advanced Configuration

### Running a Local MessageBox Server

For development, you may want to run your own MessageBox server:

1. Clone the MessageBox server repository:
   ```bash
   git clone https://github.com/bitcoin-sv/message-box-server.git
   cd message-box-server
   ```

2. Follow the setup instructions in the MessageBox server README

3. Update `.env` in the certifier platform:
   ```env
   MESSAGEBOX_HOST=http://localhost:8080
   BSV_NETWORK=local
   ```

### Production Deployment

For production deployment:

1. Use environment variables for sensitive data
2. Enable HTTPS/TLS
3. Use a reverse proxy (Nginx/Apache)
4. Implement proper authentication
5. Set up monitoring and logging
6. Use a production-grade database setup
7. Implement rate limiting
8. Add proper error handling and recovery

## License

Open BSV License

---

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review the MessageBox ecosystem documentation:
  - [@bsv/message-box-client](https://www.npmjs.com/package/@bsv/message-box-client)
  - [MessageBox Server](https://github.com/bitcoin-sv/message-box-server)
  - [BSV SDK](https://docs.bsvblockchain.org/)

---

Built with the MessageBox ecosystem on Bitcoin SV
