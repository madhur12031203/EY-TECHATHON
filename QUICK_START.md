# Quick Start Guide - Buyoh AI Features

## 🚀 Get Chat Working in 5 Minutes

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

### Step 2: Start MCP Server (Terminal 2 - NEW WINDOW)
```bash
cd backend
npm run mcp-server
```

### Step 3: Check Backend is Running
Open browser: http://localhost:3001/health

Should see: `{"status":"ok",...}`

### Step 4: Use Chat
- Go to http://localhost:3000
- Click chat widget or navigate to #/chat
- Type a message and press Enter

## 📞 Get Voice Calls Working

### Additional Setup Required:

1. **Get Twilio Account** (Free trial available)
   - Sign up: https://www.twilio.com/try-twilio
   - Get Account SID and Auth Token

2. **Set Up ngrok** (for local webhook)
   ```bash
   npm install -g ngrok
   ngrok http 3001
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

3. **Update backend/.env**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/voice/twilio/webhook
   ```

4. **Configure Twilio Phone Number**
   - Go to Twilio Console → Phone Numbers → Manage → Active numbers
   - Click your number
   - Set Voice webhook: `https://your-ngrok-url.ngrok.io/api/voice/twilio/webhook`
   - Set HTTP method: POST
   - Save

5. **Call Your Twilio Number**
   - Dial the Twilio phone number
   - AI will answer and help you!

## ⚠️ Common Issues

### Chat shows "Cannot connect to backend"
- ✅ Backend running? Check http://localhost:3001/health
- ✅ MCP server running? (separate terminal)
- ✅ Database connected? Check backend logs

### "No LLM API key configured"
- ✅ Add `GOOGLE_API_KEY=your_key` to backend/.env
- ✅ Get key: https://makersuite.google.com/app/apikey
- ✅ Restart backend

### "Database connection failed"
- ✅ PostgreSQL running?
- ✅ Database exists? (`createdb buyoh_db`)
- ✅ Migrations run? (`npm run migrate` in backend)

## 📋 Full Setup Checklist

**Backend:**
- [ ] `cd backend && npm install`
- [ ] Create `backend/.env` with DATABASE_URL and GOOGLE_API_KEY
- [ ] `createdb buyoh_db`
- [ ] `npm run migrate`
- [ ] `npm run mcp-server` (separate terminal)
- [ ] `npm run dev` (separate terminal)

**Frontend:**
- [ ] `npm install` (in root folder)
- [ ] `npm run dev`

**Test:**
- [ ] http://localhost:3001/health works
- [ ] Chat widget responds
- [ ] No errors in browser console (F12)

## 🎯 What Works Without Setup

- ✅ Frontend UI (landing page, navigation)
- ✅ Chat interface (UI only, needs backend for AI)

## 🔧 What Needs Setup

- ❌ AI Chat responses (needs: backend + database + Google API key + MCP server)
- ❌ Voice calls (needs: above + Twilio + ngrok)

See `HOW_TO_USE.md` for detailed troubleshooting!

