// fetch is built-in to Node 18+
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgsccgetvjjoerefqitb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function getLogsFromSupabase(limit, statusFilter, usernameFilter) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Supabase credentials not configured');
    return { logs: [], source: 'No data' };
  }

  try {
    // Build query
    let query = `select * from login_logs`;
    let filters = [];
    
    if (statusFilter) {
      filters.push(`status=eq.${encodeURIComponent(statusFilter)}`);
    }
    if (usernameFilter) {
      filters.push(`username=ilike.%${encodeURIComponent(usernameFilter)}%`);
    }
    
    if (filters.length > 0) {
      query += '?' + filters.join('&');
    }
    
    query += `&order=timestamp.desc&limit=${limit}`;
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/login_logs?order=timestamp.desc&limit=${limit}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const logs = await response.json();
      return { logs, source: 'Supabase' };
    } else {
      console.warn('⚠️  Failed to fetch from Supabase:', response.status);
      return { logs: [], source: 'Error' };
    }
  } catch (err) {
    console.error('Error reading from Supabase:', err.message);
    return { logs: [], source: 'Error' };
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
    const { limit = 100, status, username } = req.query;
    
    const { logs, source } = await getLogsFromSupabase(limit, status, username);
    
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
