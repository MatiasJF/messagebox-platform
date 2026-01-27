# Services Management Guide

Quick reference for starting and stopping all services for the MessageBox Certifier Platform.

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| MongoDB | 27017 | Database |
| Backend API | 3000 | Express server |
| Next.js Frontend | 3000/3001 | React application |
| Simple HTML Frontend | 3001 | Static files |

---

## 🚀 Starting Services

### Complete Startup (3 steps)

**MongoDB as Service (Recommended):**
```bash
# 1. Start MongoDB as background service
brew services start mongodb/brew/mongodb-community@8.0

# 2. Start Backend (Terminal 1)
cd whitelabel-certifier/server
npm run dev

# 3. Start Frontend (Terminal 2)
cd whitelabel-certifier/frontend-next
npm run dev
```

**MongoDB Locally (Alternative):**
```bash
# 1a. Start MongoDB in Terminal 1
mongod --dbpath ~/data/db

# 2. Start Backend (Terminal 2)
cd whitelabel-certifier/server
npm run dev

# 3. Start Frontend (Terminal 3)
cd whitelabel-certifier/frontend-next
npm run dev
```

### Verify Everything is Running

```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# Check Backend
curl http://localhost:3000/health

# Check Frontend
curl -I http://localhost:3000  # or 3001
```

---

## 🛑 Stopping Services

### Quick Stop All

```bash
# Stop all Node processes
pkill -f nodemon
pkill -f tsx
pkill -f "next dev"

# Stop MongoDB (if running as service)
brew services stop mongodb/brew/mongodb-community@8.0

# Stop MongoDB (if running locally)
pkill mongod
# or press Ctrl+C in MongoDB terminal
```

### Stop Individual Services

**Backend:**
```bash
# Option 1: Ctrl+C in terminal
# Option 2: Kill process
pkill -f "nodemon --watch src"
```

**Frontend:**
```bash
# Option 1: Ctrl+C in terminal
# Option 2: Kill by name
pkill -f "next dev"
# Option 3: Kill by port
lsof -ti:3001 | xargs kill -9
```

**MongoDB:**
```bash
# If running as service:
brew services stop mongodb/brew/mongodb-community@8.0

# If running locally:
# Press Ctrl+C in MongoDB terminal
# Or kill the process:
pkill mongod
lsof -ti:27017 | xargs kill -9
```

---

## 🔍 Checking Status

### What's Running?

```bash
# Check MongoDB
brew services list | grep mongodb

# Check ports
lsof -i :3000
lsof -i :3001
lsof -i :27017

# Check Node processes
ps aux | grep node | grep -v grep
```

### Process Management

```bash
# Find process by port
lsof -ti:3000

# Kill process by PID
kill -9 <PID>

# Kill all node processes (careful!)
pkill node
```

---

## 📝 Development Workflow

### Daily Start

```bash
# Terminal 1
brew services start mongodb/brew/mongodb-community@8.0
cd whitelabel-certifier/server && npm run dev

# Terminal 2
cd whitelabel-certifier/frontend-next && npm run dev
```

### Daily Stop

```bash
# Terminal 1 & 2: Press Ctrl+C

# Or quick stop:
pkill -f nodemon
pkill -f "next dev"
brew services stop mongodb/brew/mongodb-community@8.0
```

### After System Restart

```bash
# MongoDB won't auto-start, need to start it:
brew services start mongodb/brew/mongodb-community@8.0

# Then start backend and frontend as usual
```

---

## 🔧 Troubleshooting Commands

### Port is in use

```bash
# Find what's using the port
lsof -i :3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Or change port in .env
```

### MongoDB won't connect

```bash
# Check status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community@8.0

# Check logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Backend stuck/frozen

```bash
# Force kill all related processes
pkill -9 -f nodemon
pkill -9 -f tsx

# Clean restart
cd server
rm -rf node_modules/.cache
npm run dev
```

### Frontend not updating

```bash
# Clear Next.js cache
cd frontend-next
rm -rf .next node_modules/.cache

# Restart
npm run dev
```

---

## 💡 Pro Tips

### MongoDB: Service vs Local

**As Service (Recommended for daily use):**
- Runs in background
- Auto-starts on system boot (optional)
- No terminal needed
```bash
brew services start mongodb/brew/mongodb-community@8.0
```

**Locally (Good for debugging):**
- Runs in foreground
- See logs in real-time
- Requires terminal window
```bash
# Create data directory first (one-time setup)
mkdir -p ~/data/db

# Run MongoDB
mongod --dbpath ~/data/db

# With custom config
mongod --config /opt/homebrew/etc/mongod.conf
```

### Use tmux/screen for Multiple Terminals

```bash
# Install tmux
brew install tmux

# Start session
tmux new -s messagebox

# Split terminal
Ctrl+B then %  (vertical split)
Ctrl+B then "  (horizontal split)

# Switch between panes
Ctrl+B then arrow keys

# Detach session
Ctrl+B then d

# Reattach later
tmux attach -t messagebox
```

### Auto-restart on Changes

Both services auto-restart on file changes:
- Backend: `nodemon` watches `src/` directory
- Frontend: Next.js Fast Refresh

No need to manually restart during development!

---

## 🎯 Quick Reference Card

### Using MongoDB as Service (Recommended)

```bash
# START ALL
brew services start mongodb/brew/mongodb-community@8.0
cd whitelabel-certifier/server && npm run dev &
cd whitelabel-certifier/frontend-next && npm run dev &

# STOP ALL
pkill -f nodemon; pkill -f "next dev"
brew services stop mongodb/brew/mongodb-community@8.0

# CHECK STATUS
brew services list | grep mongodb
lsof -i :3000,3001,27017

# CLEAN RESTART
pkill -f nodemon; pkill -f "next dev"
brew services restart mongodb/brew/mongodb-community@8.0
cd server && npm run dev &
cd frontend-next && npm run dev &
```

### Using MongoDB Locally (3 Terminals)

```bash
# Terminal 1: MongoDB
mkdir -p ~/data/db
mongod --dbpath ~/data/db

# Terminal 2: Backend
cd whitelabel-certifier/server && npm run dev

# Terminal 3: Frontend
cd whitelabel-certifier/frontend-next && npm run dev

# STOP ALL (in each terminal)
Ctrl+C (in all 3 terminals)

# Or force kill all
pkill mongod
pkill -f nodemon
pkill -f "next dev"
```

---

## 📱 Platform-Specific Notes

### macOS
- Use `brew services` for MongoDB
- Use `pkill` for process management
- `lsof` for port checking

### Linux
- Use `systemctl` for MongoDB: `sudo systemctl start mongod`
- Use `pkill` or `killall` for processes
- `lsof` or `netstat` for ports

### Windows
- Use `net start MongoDB` for MongoDB
- Use Task Manager or `taskkill` for processes
- Use `netstat` for port checking

---

**See also**: [QUICKSTART.md](QUICKSTART.md) for full setup instructions
