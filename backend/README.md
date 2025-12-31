# Buyoh AI Agent Backend

Multi-agent AI system for retail assistance specializing in Home & Living and Electronics products.

## Architecture

- **Mainstream Agent**: Orchestrates conversation and routes to specialist agents
- **6 Worker Agents**:
  - Recommendation Agent: Product search, browsing, comparisons
  - Inventory Agent: Stock availability and delivery options
  - Payment Agent: Payment processing
  - Fulfillment Agent: Order creation and shipping
  - Loyalty & Offers Agent: Rewards and promotions
  - Post-Purchase Agent: Order tracking, returns, support

## Tech Stack

- Node.js + TypeScript
- Express.js
- LangChain.js + LangGraph
- PostgreSQL
- MCP (Model Context Protocol)
- Twilio (Voice integration)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cd backend
   # Create .env file (see ENV_SETUP.md for template)
   # Minimum required:
   # DATABASE_URL=postgresql://user:password@localhost:5432/buyoh_db
   # GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb buyoh_db

   # Run migrations
   npm run migrate
   ```

4. **Start MCP server (in separate terminal):**
   ```bash
   npm run mcp-server
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat API

- `POST /api/chat` - Send chat message
  ```json
  {
    "user_id": "optional-uuid",
    "session_id": "optional-session-id",
    "channel": "chat" | "voice",
    "message": "User message here"
  }
  ```

- `GET /api/chat/history/:conversation_id` - Get conversation history

### Voice API

- `POST /api/voice/twilio/webhook` - Twilio webhook handler for phone calls

## Environment Variables

See `ENV_SETUP.md` for required configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_API_KEY` - Google Gemini API key for LLM (free tier available)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `TWILIO_WEBHOOK_URL` - Public URL for Twilio webhooks

## MCP Server

The MCP server exposes database and external service tools:
- `db_queryProducts` - Query products
- `db_getInventory` - Get inventory info
- `payments_createPaymentIntent` - Create payment intent
- `orders_createOrder` - Create order
- `loyalty_getSummary` - Get loyalty account
- `loyalty_applyOffer` - Apply offers
- `support_getOrderStatus` - Get order status

## Database Schema

See `src/db/schema.sql` for complete schema. Key tables:
- `users` - User accounts
- `products` - Product catalog (home_living, electronics only)
- `product_inventory` - Stock levels
- `carts` / `cart_items` - Shopping carts
- `orders` / `order_items` - Orders
- `loyalty_accounts` / `loyalty_transactions` - Loyalty program
- `offers` - Promotional offers
- `order_fulfillments` - Shipping and delivery
- `conversations` / `messages` - Chat history

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Security & Guardrails

- Input validation and sanitization
- Category restriction (home_living, electronics only)
- Rate limiting
- Request tracing and logging
- PII protection in logs

## License

MIT

