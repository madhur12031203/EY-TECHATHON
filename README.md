# Buyoh AI

Buyoh AI is an AI-assisted fashion commerce prototype. It combines a React storefront, a connected styling assistant, product discovery, cart actions, and demo checkout with an Express/TypeScript backend.

The app is built for a real-world retail problem: helping shoppers find occasion-based outfits, check relevant catalog items, add products to cart, and complete a simple order flow from one assistant-driven experience.

## Features

- AI styling assistant for fashion shopping prompts
- Real product API with seeded fashion catalog
- Product filters by audience, occasion, type, size, and price
- Add-to-cart flow from recommendations and product listing
- Demo checkout/order confirmation
- Backend fallback catalog when PostgreSQL is not running
- Chat fallback response when the LLM provider is unavailable
- TypeScript frontend and backend

## Tech Stack

- React 19
- TypeScript
- Webpack
- Tailwind CSS
- Express.js
- PostgreSQL
- LangChain / LangGraph
- Zod validation

## Project Structure

```text
EY-TECHATHON/
  src/
    api/client.ts
    components/
      BuyohAI.tsx
      FashionCategoryPage.tsx
      SignIn.tsx
      ...
  backend/
    src/
      app.ts
      data/fashionCatalog.ts
      db/schema.sql
      routes/
        auth.ts
        chat.ts
        commerce.ts
        voice.ts
      graph/
        ...
  package.json
  webpack.config.js
```

## Run Locally

Install frontend dependencies:

```powershell
cd D:\Ey\EY-TECHATHON
npm install
```

Install backend dependencies:

```powershell
cd D:\Ey\EY-TECHATHON\backend
npm install
```

Start the backend on port `3001`:

```powershell
cd D:\Ey\EY-TECHATHON\backend
npm run build
$env:PORT="3001"
npm start
```

Start the frontend:

```powershell
cd D:\Ey\EY-TECHATHON
npm run dev
```

Open:

```text
http://localhost:3000
```

AI shopping page:

```text
http://localhost:3000/#/chat
```

Fashion catalog page:

```text
http://localhost:3000/#/fashion
```

## Backend API

Base URL:

```text
http://localhost:3001/api
```

Main endpoints:

- `GET /products` - List fashion products
- `GET /products/:id` - Get product details
- `POST /cart/items` - Add a product to cart
- `GET /cart/:cart_id` - Get cart
- `POST /orders/checkout` - Create a demo order
- `POST /chat` - Send chat message to assistant
- `GET /chat/history/:conversation_id` - Get chat history
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

## Database Setup

The backend can run without PostgreSQL by using the fallback catalog in `backend/src/data/fashionCatalog.ts`.

For database-backed mode, start PostgreSQL, configure `backend/.env`, then run:

```powershell
cd D:\Ey\EY-TECHATHON\backend
npm run migrate
```

The migration creates the schema and seeds realistic fashion products into the `products` and `product_inventory` tables.

## Environment Variables

Create `backend/.env` using `backend/env.template` as a guide.

Common values:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/buyoh_db
FRONTEND_URL=http://localhost:3000
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
JWT_SECRET=change-me
SESSION_SECRET=change-me
```

Do not commit `.env` files or real API keys.

## Useful Commands

Frontend:

```powershell
npm run dev
npm run build
```

Backend:

```powershell
npm run dev
npm run build
npm start
npm run migrate
```

## Notes

- If the AI provider or database is unavailable, the assistant still returns fallback shopping guidance and catalog matches.
- If GitHub says this repository moved, update the remote:

```powershell
git remote set-url origin https://github.com/madhur12031203/buyoh-Ai.git
```

## License

MIT
