# Quick Start Guide

Get the MessageBox Certifier Platform running in 5 minutes with Next.js frontend and persistent wallet connections.

## Prerequisites

- **Node.js** v18+
- **MongoDB** (running locally or MongoDB Atlas)
- **BSV Wallet** (Desktop or browser extension)

## Installation

```bash
# 1. Navigate to project
cd messagebox-platform

# 2. Install all dependencies (server + frontend)
npm run install:all

# 3. Create .env file
cp .env.example .env
```

## Configuration

Edit `.env` file (defaults work if MongoDB runs locally):

```env
# Server
PORT=3000
NODE_ENV=development

# MessageBox
MESSAGEBOX_HOST=https://messagebox.babbage.systems
BSV_NETWORK=mainnet

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB=messagebox_certifier
```

## Starting the Platform

### Step 1: Start MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Verify it's running
mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }
```

### Step 2: Start Backend Server

**Terminal 1:**
```bash
npm run dev:server
```

Wait for this output:
```
╔═══════════════════════════════════════════════════════════╗
║   MessageBox Certifier Platform API                      ║
║   Server running on: http://localhost:3000                ║
║   MessageBox Host: https://messagebox.babbage.systems     ║
║   MongoDB: messagebox_certifier                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 3: Start Frontend

**Terminal 2:**
```bash
npm run dev:frontend
```

Frontend starts at: **http://localhost:3001**

## Access the Platform

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## Complete Workflow

### 1. Connect Wallet (One Time)

1. Open http://localhost:3001
2. Click **"Connect Wallet"** in the header
3. Approve connection in your wallet app
4. See green dot = Connected ✓

**Your wallet stays connected across:**
- Page reloads
- Navigation between pages
- Multiple payments (no re-approval needed!)

### 2. Certify Your Identity

1. (Optional) Enter display name
2. Click **"Certify My Identity"**
3. View your identity key and transaction ID

**Behind the scenes:**
- Identity registered on BSV blockchain
- Certification stored in MongoDB
- Wallet session created (lasts 30 minutes)

### 3. Send Payments

1. Navigate to **Payments** page (wallet auto-reconnects!)
2. Click **"Show All"** to load certified users
3. Search by name (optional)
4. Select a user
5. Enter amount in satoshis
6. Click **"Send Payment"**
7. ✅ Payment sent (no wallet approval popup!)

**Key Feature:**
- **No repeated approvals** - Send 10 payments, get 1 approval
- **Persistent session** - Reload page, still connected
- **30-minute window** - Session auto-extends with activity

## Session Flow

```
┌─────────────────────────────────────────────┐
│ 1. Connect Wallet                           │
│    → Wallet prompts for approval (ONCE)     │
│    → Session created & saved to localStorage│
│    → Green dot shows "Connected"            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Page Reload                              │
│    → Session ID loaded from localStorage    │
│    → Backend validates session              │
│    → Wallet reconnects automatically ✓      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Send Multiple Payments                   │
│    → Each payment uses same session         │
│    → No wallet approval prompts             │
│    → Session extends for 30 more minutes    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Session Expires (30 min inactive)        │
│    → "Wallet Disconnected" notification     │
│    → Click "Connect Wallet" to reconnect    │
└─────────────────────────────────────────────┘
```

## Stopping Services

### Quick Stop All

```bash
# Stop backend (Terminal 1: Ctrl+C)
# Stop frontend (Terminal 2: Ctrl+C)

# Stop MongoDB
brew services stop mongodb-community  # macOS
sudo systemctl stop mongod            # Linux
```

### Force Stop (if needed)

```bash
# Kill backend
lsof -ti:3000 | xargs kill -9

# Kill frontend
lsof -ti:3001 | xargs kill -9

# Kill MongoDB
brew services stop mongodb-community
```

### Check Running Services

```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# Check ports
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :27017 # MongoDB

# Check Node processes
ps aux | grep node | grep -v grep
```

## Troubleshooting

### MongoDB Not Running

```bash
# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux

# Verify
mongosh --eval "db.adminCommand('ping')"

# Alternative: Use MongoDB Atlas (cloud)
# Get connection string, update MONGO_URI in .env
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process on port
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Wallet Won't Connect

1. Ensure BSV wallet installed:
   - [Panda Wallet](https://www.pandawallet.com/) (Recommended)
   - Desktop BSV wallet with WalletClient support
2. Unlock wallet
3. Check browser console (F12) for errors
4. Try refreshing page and reconnecting

### Session Expired

**Error:** "Wallet session expired. Please reconnect."

**Solution:**
- Sessions last 30 minutes
- Click "Connect Wallet" to create new session
- Any wallet action extends session

### Payment Fails

1. Check wallet connected (green dot in header)
2. Click "Connect Wallet" if disconnected
3. Verify recipient is certified
4. Check sufficient BSV balance
5. View backend logs for details

### Frontend Won't Load

```bash
# Clear Next.js cache
cd frontend-next
rm -rf .next node_modules/.cache
npm run dev
```

### Backend Won't Start

```bash
# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# Restart backend
cd server
npm run dev
```

## Features Summary

### Frontend (Next.js + React)
- ✅ Modern UI with Tailwind CSS
- ✅ Persistent wallet connections
- ✅ Auto-reconnection on page load
- ✅ Visual connection status
- ✅ Search certified users
- ✅ Responsive design

### Backend (Node.js + Express)
- ✅ Wallet session management
- ✅ 30-minute session timeout
- ✅ Auto-cleanup expired sessions
- ✅ MongoDB integration
- ✅ MessageBox SDK integration

### Key Benefits
- **Connect once, use everywhere** - No repeated approvals
- **Reload-safe** - Wallet stays connected
- **Multi-payment** - Send 100 payments, approve once
- **Auto-reconnect** - Session validates on load

## API Quick Reference

### Wallet Session

```bash
# Connect wallet (creates session)
curl -X POST http://localhost:3000/api/wallet/connect

# Check session status
curl -H "X-Session-Id: SESSION_ID" \
  http://localhost:3000/api/wallet/status

# Disconnect
curl -X POST http://localhost:3000/api/wallet/disconnect \
  -H "X-Session-Id: SESSION_ID"
```

### Identity & Payments

```bash
# Certify identity (with session)
curl -X POST http://localhost:3000/api/certify \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: SESSION_ID" \
  -d '{"alias": "John"}'

# List certified users
curl http://localhost:3000/api/certified-users

# Send payment (requires session)
curl -X POST http://localhost:3000/api/initiate-payment \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: SESSION_ID" \
  -d '{"recipient": "IDENTITY_KEY", "amount": 10000}'
```

## Project Scripts

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev:server    # Start backend only
npm run dev:frontend  # Start frontend only

# Production
npm run build:server
npm run build:frontend
npm run start:server
npm run start:frontend
```

## Next Steps

- Read full [README.md](README.md) for detailed documentation
- Explore wallet session management
- Customize Tailwind CSS styling in `frontend-next/`
- Add user authentication
- Deploy to production with PM2 or Docker

## Project Structure

```
messagebox-platform/
├── server/              # Backend (port 3000)
│   ├── src/
│   │   ├── wallet/      # Session manager
│   │   ├── routes/      # API endpoints
│   │   └── storage/     # MongoDB layer
│   └── package.json
│
└── frontend-next/       # Frontend (port 3001)
    ├── app/             # Next.js pages
    ├── components/      # React components
    ├── lib/             # Wallet manager
    └── package.json
```

---

**That's it!** You now have a modern BSV payment platform with persistent wallet connections.

Open **http://localhost:3001** and start certifying identities and sending payments!
