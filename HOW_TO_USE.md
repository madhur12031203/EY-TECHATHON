# How to Use Buyoh AI Chat & Call Features

## Prerequisites

Before using the AI chat or call features, you need to have the backend server running and properly configured.

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Make sure you have a `.env` file in the `backend` directory with at minimum:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/buyoh_db
GOOGLE_API_KEY=your_google_api_key_here
```

### 1.3 Set Up Database

```bash
# Create the database
createdb buyoh_db

# Run migrations
cd backend
npm run migrate
```

### 1.4 Start MCP Server (Required for AI features)

In a **separate terminal window**:

```bash
cd backend
npm run mcp-server
```

Keep this running - it's required for the AI agents to access database tools.

### 1.5 Start Backend Server

In another terminal:

```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:3001`

You should see:
```
Server running on port 3001 in development mode
Database connection established
```

## Step 2: Using the Chat Feature

### 2.1 Access Chat

1. **Chat Widget**: Look for the chat widget on the home page (bottom right corner)
2. **Chat Page**: Navigate to `http://localhost:3000#/chat` or click "Chat with AI" in the header

### 2.2 Start Chatting

1. Type your message in the chat input
2. Press Enter or click Send
3. The AI will respond with help on Home & Living or Electronics products

### 2.3 Example Queries

- "Show me electronics products"
- "Find home decor items"
- "What's in stock for smart home devices?"
- "I want to compare TVs"
- "Add a laptop to my cart"

## Step 3: Using the Call Feature (Voice)

### 3.1 Prerequisites for Voice Calls

You need to set up Twilio:

1. **Get Twilio Account**:
   - Sign up at https://www.twilio.com/
   - Get Account SID and Auth Token from the console

2. **Get a Phone Number**:
   - Buy a phone number in Twilio console
   - Note the phone number

3. **Set Up Webhook**:
   - For local development, use ngrok or similar:
     ```bash
     ngrok http 3001
     ```
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. **Update `.env` file**:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/voice/twilio/webhook
   ```

5. **Configure Twilio**:
   - In Twilio console, go to your phone number settings
   - Set the Voice webhook URL to: `https://your-ngrok-url.ngrok.io/api/voice/twilio/webhook`
   - Set HTTP method to POST

### 3.2 Make a Call

1. Call your Twilio phone number from any phone
2. The AI assistant will answer
3. Speak naturally - the AI will understand and respond
4. Ask about products, check inventory, place orders, etc.

## Troubleshooting

### Chat Not Working

**Error: "Cannot connect to backend"**

1. Check if backend is running:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok",...}`

2. Check browser console (F12) for CORS errors

3. Verify backend logs show:
   - Server started on port 3001
   - Database connected
   - No errors

**Error: "Backend server error"**

1. Check backend terminal for error messages
2. Verify database is running and connected:
   ```bash
   psql buyoh_db -c "SELECT 1;"
   ```
3. Check if Google API key is valid
4. Ensure MCP server is running

**Error: "No LLM API key configured"**

1. Add `GOOGLE_API_KEY` to `backend/.env`
2. Get key from: https://makersuite.google.com/app/apikey
3. Restart backend server

### Call Not Working

**Twilio webhook not receiving calls:**

1. Verify ngrok is running and URL is correct
2. Check Twilio webhook URL matches your ngrok URL
3. Check backend logs for webhook requests
4. Verify Twilio credentials in `.env` are correct

**Call connects but AI doesn't respond:**

1. Check backend logs for errors
2. Verify Google API key is set
3. Check if MCP server is running
4. Look for errors in backend terminal

### General Issues

**"Database connection failed"**

1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Find PostgreSQL service
   
   # Mac/Linux
   sudo service postgresql status
   ```

2. Verify DATABASE_URL in `.env` is correct
3. Check database exists:
   ```bash
   psql -l | grep buyoh_db
   ```

**"MCP server not found"**

1. Ensure MCP server is running in a separate terminal
2. Check if `npm run mcp-server` command works
3. Verify no errors in MCP server terminal

## Testing

### Test Backend Health

```bash
curl http://localhost:3001/health
```

### Test Chat API

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "channel": "chat"
  }'
```

### Test Database Connection

```bash
cd backend
npm run migrate
```

## Quick Start Checklist

- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] `.env` file created with DATABASE_URL and GOOGLE_API_KEY
- [ ] PostgreSQL database created (`createdb buyoh_db`)
- [ ] Database migrations run (`npm run migrate`)
- [ ] MCP server running (`npm run mcp-server` in separate terminal)
- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] Frontend running (`npm run dev` in root folder)
- [ ] Browser console shows no errors (F12)
- [ ] Backend health check works (http://localhost:3001/health)

## Need Help?

Check the error messages in:
1. Browser console (F12 → Console tab)
2. Backend terminal output
3. MCP server terminal output

The improved error messages will now tell you exactly what's missing!

