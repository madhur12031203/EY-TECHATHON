# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

## Required Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/buyoh_db

# LLM Configuration (at least one required)
# Google Gemini (recommended - free tier available)
GOOGLE_API_KEY=your_google_api_key_here
# Or use OpenAI instead:
# OPENAI_API_KEY=your_openai_api_key_here
```

## Optional Variables

```env
# Alternative LLM (use instead of OpenAI)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Twilio Configuration (required only for voice features)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/voice/twilio/webhook

# MCP Server Configuration (optional, defaults shown)
MCP_SERVER_PATH=./mcp-server/index.ts
MCP_TRANSPORT=stdio

# Payment Gateway (optional, for Stripe integration)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Security (optional, defaults shown)
JWT_SECRET=change-me-in-production
SESSION_SECRET=change-me-in-production

# Logging (optional, defaults to 'info')
LOG_LEVEL=info

# Frontend URL (optional, for CORS)
FRONTEND_URL=http://localhost:3000
```

## Quick Setup

1. Copy this template to create your `.env` file:
   ```bash
   cd backend
   # Create .env file manually or use:
   cat > .env << EOF
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/buyoh_db
   OPENAI_API_KEY=your_openai_api_key_here
   EOF
   ```

2. Replace placeholder values with your actual credentials:
   - `your_password` - Your PostgreSQL password
   - `your_google_api_key_here` - Your Google API key from https://makersuite.google.com/app/apikey (free tier available)
   - `buyoh_db` - Your database name (or create it with `createdb buyoh_db`)

3. For voice features, add Twilio credentials:
   - Get credentials from https://www.twilio.com/console
   - Set `TWILIO_WEBHOOK_URL` to your public URL (use ngrok for local testing)

## Notes

- The `.env` file is gitignored and will not be committed to version control
- At minimum, you need `DATABASE_URL` and `GOOGLE_API_KEY` (or `OPENAI_API_KEY`) to run the backend
- Twilio is only needed if you want to use voice/phone call features
- Stripe is only needed if you want to process real payments (currently simulated)

