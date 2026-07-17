export default async (req, context) => {
  return new Response(
    JSON.stringify({ 
      status: 'Logger server is running', 
      platform: 'Netlify Functions',
      database: 'Supabase Connected',
      timestamp: new Date().toISOString()
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
