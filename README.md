# MessageBox Certifier Platform

A modern web application for certifying identities and sending payments on the MessageBox network built on Bitcoin SV (BSV). Features a Next.js frontend with persistent wallet connections and a Node.js backend with session management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Wallet Session Management](#wallet-session-management)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

This platform provides a complete solution for:

1. **Identity Certification**: Certify your identity with the MessageBox network via blockchain-backed transactions
2. **Payment Interface**: Send BSV payments to certified users with persistent wallet connections
3. **Session Management**: Connect your wallet once and reuse for multiple operations

The system leverages the MessageBox ecosystem:
- `@bsv/message-box-client` for messaging and payment functionality
- `@bsv/sdk` for BSV blockchain integration
- SHIP overlay network for identity-to-host discovery
- MongoDB for certified user storage
- Session-based wallet management for seamless UX

## Features

### Frontend (Next.js + React + Tailwind CSS)
- ✅ **Modern UI** - Built with Next.js 15, React 19, and Tailwind CSS
- ✅ **Persistent Wallet Connection** - Stays connected across page reloads
- ✅ **Session Management** - 30-minute sessions, no repeated wallet approvals
- ✅ **Type-Safe** - Full TypeScript coverage
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Visual Status Indicators** - Real-time connection status with animated indicators

### Backend (Node.js + Express + TypeScript)
- ✅ **Wallet Session Manager** - Server-side wallet connection pooling
- ✅ **RESTful API** - Clean API endpoints for all operations
- ✅ **MongoDB Integration** - Persistent storage for certified users
- ✅ **MessageBox SDK** - Full integration with BSV ecosystem
- ✅ **Session Validation** - Automatic session expiration and cleanup

### Key Capabilities
- **Identity Certification Page** - Certify identity with optional alias
- **Payments Page** - Browse, search, and pay certified users
- **Automatic Reconnection** - Wallet reconnects on page reload
- **Multiple Payments** - Send many payments without re-approving wallet
- **Session Persistence** - 30-minute wallet sessions survive page navigation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           Frontend (Next.js + React + TypeScript)           │
│                                                               │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  / (Certification)   │    │  /payments           │      │
│  │  - Connect wallet    │    │  - Browse users      │      │
│  │  - Certify identity  │    │  - Send payments     │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WalletProvider (React Context)                      │  │
│  │  - Session state management                           │  │
│  │  - localStorage persistence                           │  │
│  │  - Auto-reconnection on load                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ X-Session-Id header
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend (Express + TypeScript + MongoDB)          │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Wallet Session Manager                            │    │
│  │  - Singleton wallet instances                      │    │
│  │  - 30-minute session timeout                       │    │
│  │  - Automatic cleanup                               │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routes                                            │    │
│  │  • POST /api/wallet/connect                        │    │
│  │  • GET  /api/wallet/status                         │    │
│  │  • POST /api/wallet/disconnect                     │    │
│  │  • POST /api/certify                               │    │
│  │  • GET  /api/certified-users                       │    │
│  │  • POST /api/initiate-payment                      │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MessageBox SDK Integration                        │    │
│  │  • WalletClient (session-based)                    │    │
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

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v6 or higher)
  - Local: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **BSV Wallet** (Desktop wallet or browser extension with WalletClient support)

## Quick Start

### 1. Install All Dependencies

```bash
# From the root directory
npm run install:all
```

This installs dependencies for both server and frontend.

### 2. Configure Environment

Create `.env` file in the root:

```bash
cp .env.example .env
```

Edit `.env`:

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

### 3. Start MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Verify it's running
mongosh --eval "db.adminCommand('ping')"
```

### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev:frontend
```

### 5. Open the Application

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MESSAGEBOX_HOST` | MessageBox server URL | `https://messagebox.babbage.systems` |
| `BSV_NETWORK` | BSV network (mainnet/testnet) | `mainnet` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB` | Database name | `messagebox_certifier` |

### MongoDB Setup

#### Local MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verify
mongosh --eval "db.adminCommand('ping')"
```

#### MongoDB Atlas (Cloud)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Usage

### Certification Page (/)

1. Click **"Connect Wallet"** in the header
2. Approve wallet connection in your wallet app
3. (Optional) Enter display name
4. Click **"Certify My Identity"**
5. View certification results with transaction ID

**Behind the scenes:**
- Wallet session created on backend (30-minute duration)
- Session ID saved to localStorage
- Identity certified on BSV blockchain
- Certification stored in MongoDB

### Payments Page (/payments)

1. Wallet automatically reconnects from session
2. Click **"Show All"** to load certified users
3. Search by display name (optional)
4. Click **"Select for Payment"** on a user
5. Enter amount in satoshis
6. Click **"Send Payment"**
7. Payment sent instantly (no wallet re-approval needed!)

**Behind the scenes:**
- Frontend includes session ID in request header
- Backend reuses existing wallet connection
- Payment sent via MessageBox PeerPay protocol
- Session extended for another 30 minutes

### Wallet Session Flow

```
1. First Connection:
   User clicks "Connect Wallet" → Wallet prompts → Session created →
   Session ID saved to localStorage

2. Page Reload:
   Page loads → Session ID loaded from localStorage →
   Session validated with backend → Wallet reconnected ✓

3. Sending Payments:
   User sends payment → Session ID included in request →
   Backend reuses wallet → Payment sent (no approval needed) ✓

4. Session Expiration (30 min):
   Session expires → User notified → Click "Connect Wallet" →
   New session created
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Wallet Session Endpoints

#### POST /api/wallet/connect
Create a new wallet session.

**Response:**
```json
{
  "success": true,
  "sessionId": "abc123...",
  "identityKey": "0277a2b...",
  "message": "Wallet connected successfully"
}
```

#### GET /api/wallet/status
Check session validity.

**Headers:**
```
X-Session-Id: abc123...
```

**Response:**
```json
{
  "success": true,
  "connected": true,
  "identityKey": "0277a2b...",
  "connectedAt": "2025-01-27T10:30:00.000Z"
}
```

#### POST /api/wallet/disconnect
Destroy wallet session.

**Headers:**
```
X-Session-Id: abc123...
```

**Response:**
```json
{
  "success": true,
  "disconnected": true,
  "message": "Wallet disconnected successfully"
}
```

### Identity & Payment Endpoints

#### POST /api/certify
Certify identity on MessageBox network.

**Headers:**
```
X-Session-Id: abc123... (optional - creates new wallet if not provided)
```

**Request:**
```json
{
  "alias": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "identityKey": "0277a2b...",
  "txid": "abc123...",
  "alias": "John Doe",
  "message": "Identity successfully certified"
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
      "identityKey": "0277a2b...",
      "alias": "John Doe",
      "certificationDate": "2025-01-27T10:30:00.000Z",
      "host": "https://messagebox.babbage.systems"
    }
  ]
}
```

#### GET /api/certified-users/search?q={query}
Search users by alias.

**Query Params:**
- `q`: Search query

#### POST /api/initiate-payment
Send payment to certified user.

**Headers:**
```
X-Session-Id: abc123... (required)
```

**Request:**
```json
{
  "recipient": "0277a2b...",
  "amount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "Payment sent successfully"
}
```

**Error Response (No Session):**
```json
{
  "success": false,
  "error": "No wallet session. Please connect your wallet first."
}
```

## Project Structure

```
messagebox-platform/
├── README.md                          # This file
├── QUICKSTART.md                      # Quick start guide
├── .env.example                       # Environment template
├── package.json                       # Root scripts
│
├── server/                            # Backend
│   ├── src/
│   │   ├── index.ts                   # Main server
│   │   ├── types.ts                   # Type definitions
│   │   ├── wallet/
│   │   │   └── WalletSessionManager.ts # Session manager
│   │   ├── routes/
│   │   │   ├── walletSession.ts       # Wallet session routes
│   │   │   ├── certify.ts             # Certification route
│   │   │   ├── payment.ts             # Payment route
│   │   │   └── listCertified.ts       # User listing
│   │   └── storage/
│   │       └── CertificationStorage.ts # MongoDB layer
│   └── package.json
│
└── frontend-next/                     # Frontend (Next.js)
    ├── app/
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Certification page
    │   ├── payments/
    │   │   └── page.tsx               # Payments page
    │   └── globals.css                # Global styles
    ├── components/
    │   ├── WalletProvider.tsx         # Wallet context
    │   ├── WalletStatus.tsx           # Connection UI
    │   └── Navigation.tsx             # Header nav
    ├── lib/
    │   └── walletManager.ts           # Session manager
    └── package.json
```

## Wallet Session Management

### How It Works

1. **Session Creation**
   - User clicks "Connect Wallet"
   - Backend creates `WalletClient` instance
   - Generates unique session ID (32 bytes hex)
   - Stores wallet instance in memory (Map)
   - Returns session ID to frontend

2. **Session Persistence**
   - Frontend saves session ID to localStorage
   - Session ID included in all API requests via `X-Session-Id` header
   - Backend retrieves wallet from session Map
   - Same wallet reused for all operations

3. **Session Validation**
   - Sessions expire after 30 minutes of inactivity
   - Each request extends session lifetime
   - Expired sessions automatically cleaned up every 5 minutes
   - Frontend validates session on app load

4. **Session Termination**
   - User clicks "Disconnect"
   - Session deleted from backend Map
   - localStorage cleared on frontend
   - User can reconnect anytime

### Benefits

✅ **Connect Once** - Single wallet approval for multiple operations
✅ **Persistent** - Survives page reloads and navigation
✅ **Secure** - Session IDs are random, no private keys stored
✅ **Automatic** - Reconnects on app load
✅ **Clean** - Expired sessions auto-cleanup

## Troubleshooting

### Wallet Won't Connect

**Problem:** "Failed to connect wallet" error

**Solution:**
1. Ensure you have a BSV wallet installed (desktop or browser extension)
2. Check wallet supports `WalletClient` protocol
3. Verify wallet is unlocked
4. Check browser console for detailed errors

### Session Expired

**Problem:** "Wallet session expired. Please reconnect."

**Solution:**
- Sessions last 30 minutes of inactivity
- Click "Connect Wallet" to create new session
- To extend: Perform any action within 30 minutes

### Payment Fails

**Problem:** "No wallet session" or payment errors

**Solution:**
1. Check wallet connection status (green dot = connected)
2. Click "Connect Wallet" if disconnected
3. Ensure recipient is certified
4. Verify sufficient BSV balance
5. Check backend logs for detailed errors

### MongoDB Connection Failed

**Problem:** `MongoServerError: connection refused`

**Solution:**
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use

**Problem:** `EADDRINUSE: port 3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

## Advanced

### Running Both Services with One Command

Create `start.sh` in root:
```bash
#!/bin/bash
npm run dev:server &
npm run dev:frontend &
wait
```

Then:
```bash
chmod +x start.sh
./start.sh
```

### Production Deployment

1. Build both applications:
   ```bash
   npm run build:server
   npm run build:frontend
   ```

2. Use process manager (PM2):
   ```bash
   pm2 start npm --name "certifier-server" -- run start:server
   pm2 start npm --name "certifier-frontend" -- run start:frontend
   ```

3. Use reverse proxy (Nginx) for production routing

## License

Open BSV License

---

## Support

For issues:
- Check [Troubleshooting](#troubleshooting)
- Review MessageBox documentation:
  - [@bsv/sdk](https://docs.bsvblockchain.org/)
  - [@bsv/message-box-client](https://www.npmjs.com/package/@bsv/message-box-client)

---

**Built with Next.js, React, and the MessageBox ecosystem on Bitcoin SV**
