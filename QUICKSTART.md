# Quick Start Guide

Get the MessageBox Certifier Platform running in 5 minutes.

## Prerequisites

- Node.js v18+
- MongoDB (running locally or MongoDB Atlas)

## Installation

```bash
# 1. Navigate to project
cd whitelabel-certifier

# 2. Install server dependencies
cd server
npm install
cd ..

# 3. Install frontend dependencies (if using Next.js)
cd frontend-next
npm install
cd ..

# 4. Create .env file
cp .env.example .env
```

## Configuration

Edit `.env` file (use defaults if MongoDB is running locally):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017
MONGO_DB=messagebox_certifier
MESSAGEBOX_HOST=https://messagebox.babbage.systems
BSV_NETWORK=mainnet
```

## Starting Services

### Step 1: Start MongoDB

**Option A: Run as Background Service (Recommended)**

```bash
# macOS (with Homebrew)
brew services start mongodb/brew/mongodb-community@8.0

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: Run Locally in Terminal**

If you prefer to run MongoDB in a terminal window (useful for debugging):

```bash
# macOS/Linux - Run mongod directly
mongod --dbpath ~/data/db

# Or with config file (if you have one)
mongod --config /opt/homebrew/etc/mongod.conf

# Windows
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Verify MongoDB is Running:**
```bash
mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }
```

### Step 2: Start Backend Server

**Terminal 1:**
```bash
cd whitelabel-certifier/server
npm run dev
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

**Option A: Next.js Frontend (Recommended)**

**Terminal 2:**
```bash
cd whitelabel-certifier/frontend-next
npm run dev
```

Access at: **http://localhost:3000** (Next.js will auto-select available port)

**Option B: Simple HTML Frontend**

**Terminal 2:**
```bash
cd whitelabel-certifier/client
npx http-server public -p 3001
```

Access at: **http://localhost:3001**

## Stopping Services

### Stop All Services

**Stop Backend Server:**
```bash
# In Terminal 1, press: Ctrl+C
# Or kill the process:
pkill -f "nodemon --watch src"
```

**Stop Frontend:**
```bash
# Next.js - In Terminal 2, press: Ctrl+C
# Or kill the process:
pkill -f "next dev"

# Simple HTML - In Terminal 2, press: Ctrl+C
# Or kill by port:
lsof -ti:3001 | xargs kill -9
```

**Stop MongoDB:**

If running as a service:
```bash
# macOS (with Homebrew)
brew services stop mongodb/brew/mongodb-community@8.0

# Linux (systemd)
sudo systemctl stop mongod

# Windows
net stop MongoDB
```

If running locally in terminal:
```bash
# In MongoDB terminal, press: Ctrl+C
# Or kill the process:
pkill mongod

# Or kill by port:
lsof -ti:27017 | xargs kill -9
```

### Quick Stop All (macOS/Linux)

```bash
# Stop backend
pkill -f "nodemon"
pkill -f "tsx"

# Stop frontend
pkill -f "next dev"
# or
lsof -ti:3001 | xargs kill -9

# Stop MongoDB
brew services stop mongodb/brew/mongodb-community@8.0
```

### Check What's Running

```bash
# Check if MongoDB is running
brew services list | grep mongodb
# or
mongosh --eval "db.adminCommand('ping')"

# Check what's using ports 3000 and 3001
lsof -i :3000
lsof -i :3001

# Check running Node processes
ps aux | grep node | grep -v grep
```

## Access

**Next.js Frontend:**
- http://localhost:3000 (or whatever port Next.js shows)

**Simple HTML Frontend:**
- **Certification Page**: http://localhost:3001
- **Payments Page**: http://localhost:3001/payments.html

**Backend API:**
- http://localhost:3000

## Test the Flow

### 1. Certify an Identity

1. Go to http://localhost:3001
2. Enter a display name (e.g., "Alice")
3. Click "Certify My Identity"
4. Copy the identity key shown

### 2. Certify Another Identity

1. Reload the page
2. Enter another name (e.g., "Bob")
3. Click "Certify My Identity"

### 3. Send a Payment

1. Go to http://localhost:3001/payments.html
2. Click "Show All"
3. Select a certified user
4. Enter amount (e.g., 10000 satoshis)
5. Click "Send Payment"

## Troubleshooting

### MongoDB not running?

```bash
# Start MongoDB
brew services start mongodb/brew/mongodb-community@8.0

# Check status
brew services list | grep mongodb

# Verify connection
mongosh --eval "db.adminCommand('ping')"

# Or use MongoDB Atlas (cloud) - free tier available
# Get connection string and update MONGO_URI in .env
```

### Port already in use?

**Find what's using the port:**
```bash
lsof -i :3000
lsof -i :3001
```

**Kill the process:**
```bash
# Kill by port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
PORT=3002
```

### Backend won't start?

```bash
# Check if MongoDB is connected
mongosh --eval "db.adminCommand('ping')"

# Check server logs
cd server
tail -f server.log

# Restart from scratch
pkill -f nodemon
cd server
npm run dev
```

### Frontend won't load?

```bash
# Next.js frontend
cd frontend-next
rm -rf .next node_modules/.cache
npm run dev

# Simple HTML frontend - try different server
cd client/public
python3 -m http.server 3001
# or
php -S localhost:3001
```

### Can't connect wallet?

Make sure you have a BSV wallet installed:
- [Panda Wallet](https://www.pandawallet.com/) (Recommended)
- [Yours Wallet](https://yours.org/)

Check browser console (F12) for errors.

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API at http://localhost:3000
- Customize the frontend styling in `client/public/styles.css`
- Add authentication and user management
- Deploy to production

## API Quick Reference

```bash
# Certify identity
curl -X POST http://localhost:3000/api/certify \
  -H "Content-Type: application/json" \
  -d '{"alias": "John"}'

# List certified users
curl http://localhost:3000/api/certified-users

# Send payment
curl -X POST http://localhost:3000/api/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{"recipient": "IDENTITY_KEY", "amount": 10000}'
```

---

That's it! You now have a working MessageBox certifier platform.
