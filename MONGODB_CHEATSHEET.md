# MongoDB Cheatsheet

Quick reference for MongoDB commands in the MessageBox Certifier Platform.

---

## 🚀 Starting MongoDB

### Option 1: As Background Service (Recommended)

**Start:**
```bash
brew services start mongodb/brew/mongodb-community@8.0
```

**Pros:**
- Runs in background
- Doesn't require terminal window
- Can auto-start on system boot
- Good for daily development

**Cons:**
- Less visibility into what's happening
- Logs are in separate file

---

### Option 2: Locally in Terminal

**Start:**
```bash
# Create data directory (one-time setup)
mkdir -p ~/data/db

# Run MongoDB
mongod --dbpath ~/data/db
```

**With config file:**
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

**Pros:**
- See logs in real-time
- Easier debugging
- More control

**Cons:**
- Requires dedicated terminal
- Stops when terminal closes
- More manual management

---

## 🛑 Stopping MongoDB

### If Running as Service

```bash
# Stop service
brew services stop mongodb/brew/mongodb-community@8.0

# Restart service
brew services restart mongodb/brew/mongodb-community@8.0
```

### If Running Locally

```bash
# In terminal: Press Ctrl+C

# Or kill process:
pkill mongod

# Or kill by port:
lsof -ti:27017 | xargs kill -9
```

---

## 🔍 Checking Status

```bash
# Check if service is running
brew services list | grep mongodb

# Check if MongoDB is responding
mongosh --eval "db.adminCommand('ping')"

# Check what's using MongoDB port
lsof -i :27017

# Check MongoDB processes
ps aux | grep mongod | grep -v grep
```

---

## 🔧 Common Commands

### Connect to MongoDB Shell

```bash
mongosh
```

### List Databases

```bash
mongosh --eval "show dbs"
```

### Use Specific Database

```bash
mongosh messagebox_certifier
```

### Check Collections

```bash
mongosh messagebox_certifier --eval "show collections"
```

### View Certified Users

```bash
mongosh messagebox_certifier --eval "db.certified_users.find().pretty()"
```

### Count Documents

```bash
mongosh messagebox_certifier --eval "db.certified_users.countDocuments()"
```

### Clear Collection (Careful!)

```bash
mongosh messagebox_certifier --eval "db.certified_users.deleteMany({})"
```

---

## 📂 Data Directory

**Default location (Homebrew):**
```
/opt/homebrew/var/mongodb
```

**Custom location:**
```bash
mongod --dbpath ~/data/db
```

**Create custom data directory:**
```bash
mkdir -p ~/data/db
chmod 755 ~/data/db
```

---

## 📝 Configuration File

**Location (Homebrew):**
```
/opt/homebrew/etc/mongod.conf
```

**View config:**
```bash
cat /opt/homebrew/etc/mongod.conf
```

**Edit config:**
```bash
nano /opt/homebrew/etc/mongod.conf
```

---

## 🐛 Troubleshooting

### MongoDB won't start

```bash
# Check if already running
lsof -i :27017

# Check logs (if using service)
tail -f /opt/homebrew/var/log/mongodb/mongo.log

# Check data directory permissions
ls -la ~/data/db
chmod 755 ~/data/db

# Force kill existing process
pkill -9 mongod
lsof -ti:27017 | xargs kill -9
```

### Connection refused

```bash
# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check service status
brew services list | grep mongodb

# Restart service
brew services restart mongodb/brew/mongodb-community@8.0
```

### Port already in use

```bash
# Find what's using the port
lsof -i :27017

# Kill the process
lsof -ti:27017 | xargs kill -9
```

---

## 🔐 Security

### Set Admin User (Optional)

```bash
mongosh admin
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: ["root"]
})
```

### Connect with Auth

```bash
mongosh -u admin -p your_password --authenticationDatabase admin
```

---

## 📊 Monitoring

### Check Database Size

```bash
mongosh messagebox_certifier --eval "db.stats()"
```

### Monitor in Real-time

```bash
mongosh --eval "while(true) { printjson(db.serverStatus()); sleep(5000); }"
```

### View Current Operations

```bash
mongosh --eval "db.currentOp()"
```

---

## 🔄 Backup & Restore

### Backup

```bash
mongodump --db=messagebox_certifier --out=/path/to/backup
```

### Restore

```bash
mongorestore --db=messagebox_certifier /path/to/backup/messagebox_certifier
```

---

## 💻 Platform-Specific

### macOS (Homebrew)

```bash
# Install
brew tap mongodb/brew
brew install mongodb-community@8.0

# Manage service
brew services start mongodb/brew/mongodb-community@8.0
brew services stop mongodb/brew/mongodb-community@8.0
brew services restart mongodb/brew/mongodb-community@8.0

# Config location
/opt/homebrew/etc/mongod.conf

# Data location
/opt/homebrew/var/mongodb

# Logs location
/opt/homebrew/var/log/mongodb/mongo.log
```

### Linux (systemd)

```bash
# Manage service
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
sudo systemctl status mongod

# Config location
/etc/mongod.conf

# Data location
/var/lib/mongodb

# Logs location
/var/log/mongodb/mongod.log
```

### Windows

```bash
# Start service
net start MongoDB

# Stop service
net stop MongoDB

# Config location
C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg

# Data location
C:\data\db

# Logs location
C:\data\log\mongod.log
```

---

## 📚 Resources

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Shell Commands](https://docs.mongodb.com/manual/reference/mongo-shell/)
- [Homebrew MongoDB](https://github.com/mongodb/homebrew-brew)

---

**Quick Links:**
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [SERVICES_MANAGEMENT.md](SERVICES_MANAGEMENT.md) - All services
