# Buyoh AI Agent System - Setup Guide

Complete setup guide for the multi-agent AI system for Home & Living and Electronics retail.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- OpenAI API key (or Anthropic API key)
- Twilio account (for voice integration - optional)

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# Create .env file manually (see backend/ENV_SETUP.md for template)
# Minimum required variables:
# DATABASE_URL=postgresql://user:password@localhost:5432/buyoh_db
# GOOGLE_API_KEY=your_google_api_key_here
```

### 2. Database Setup

```bash
# Create database
createdb buyoh_db

# Run migrations
npm run migrate
```

### 3. Start MCP Server

In a separate terminal:

```bash
cd backend
npm run mcp-server
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### 5. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/buyoh_db

# LLM (Google Gemini - free tier available)
GOOGLE_API_KEY=your_google_api_key

# Twilio (for voice)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/voice/twilio/webhook
```

### Frontend Configuration

Update `src/api/client.ts` if your backend runs on a different port:

```typescript
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
```

## Architecture Overview

### Agents

1. **Orchestrator Agent**: Routes user intents to specialist agents
2. **Recommendation Agent**: Product search and recommendations
3. **Inventory Agent**: Stock availability
4. **Payment Agent**: Payment processing
5. **Fulfillment Agent**: Order creation and shipping
6. **Loyalty & Offers Agent**: Rewards and promotions
7. **Post-Purchase Agent**: Order tracking and support

### Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **AI Framework**: LangChain.js + LangGraph
- **Database**: PostgreSQL
- **MCP**: Model Context Protocol for tool integration
- **Voice**: Twilio Programmable Voice
- **Frontend**: React + TypeScript

## API Endpoints

### Chat API

- `POST /api/chat` - Send chat message
- `GET /api/chat/history/:conversation_id` - Get conversation history

### Voice API

- `POST /api/voice/twilio/webhook` - Twilio webhook handler

## Testing

### Test Chat API

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me electronics products",
    "channel": "chat"
  }'
```

### Test Database Connection

```bash
psql buyoh_db -c "SELECT COUNT(*) FROM products;"
```

## Troubleshooting

### MCP Server Not Starting

- Ensure Node.js is in PATH
- Check that `mcp-server/index.ts` exists
- Verify TypeScript is installed: `npm install -g typescript`

### Database Connection Errors

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb buyoh_db`

### LangGraph Errors

- Verify OpenAI API key is set
- Check that LangGraph dependencies are installed
- Review logs in `backend/logs/`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build backend: `npm run build`
3. Use process manager (PM2, systemd, etc.)
4. Set up reverse proxy (nginx, etc.)
5. Configure SSL/TLS
6. Set up monitoring and logging

## License

MIT

