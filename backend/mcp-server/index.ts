#!/usr/bin/env node
/**
 * MCP Server for Buyoh AI Agent System
 * Exposes database and external service tools to LangGraph agents
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/buyoh_db',
});

// Tool schemas using Zod
const QueryProductsSchema = z.object({
  category: z.enum(['home_living', 'electronics']).optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  search_query: z.string().optional(),
  limit: z.number().default(10),
  offset: z.number().default(0),
});

const GetInventorySchema = z.object({
  sku: z.string().optional(),
  product_id: z.string().optional(),
  location_id: z.string().optional(),
});

const CreatePaymentIntentSchema = z.object({
  cart_id: z.string(),
  user_id: z.string(),
  amount: z.number(),
});

const CreateOrderSchema = z.object({
  cart_id: z.string(),
  user_id: z.string(),
  payment_id: z.string().optional(),
});

const GetLoyaltySummarySchema = z.object({
  user_id: z.string(),
});

const ApplyOfferSchema = z.object({
  user_id: z.string(),
  cart_id: z.string(),
});

const GetOrderStatusSchema = z.object({
  order_id: z.string(),
});

// Tool implementations
async function queryProducts(params: z.infer<typeof QueryProductsSchema>) {
  const validated = QueryProductsSchema.parse(params);
  let query = 'SELECT * FROM products WHERE 1=1';
  const values: any[] = [];
  let paramIndex = 1;

  if (validated.category) {
    query += ` AND category = $${paramIndex++}`;
    values.push(validated.category);
  }

  if (validated.price_min !== undefined) {
    query += ` AND price >= $${paramIndex++}`;
    values.push(validated.price_min);
  }

  if (validated.price_max !== undefined) {
    query += ` AND price <= $${paramIndex++}`;
    values.push(validated.price_max);
  }

  if (validated.search_query) {
    query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex++})`;
    values.push(`%${validated.search_query}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(validated.limit, validated.offset);

  const result = await pool.query(query, values);
  return { products: result.rows };
}

async function getInventory(params: z.infer<typeof GetInventorySchema>) {
  const validated = GetInventorySchema.parse(params);
  let query = 'SELECT pi.*, p.name, p.sku FROM product_inventory pi JOIN products p ON pi.product_id = p.id WHERE 1=1';
  const values: any[] = [];
  let paramIndex = 1;

  if (validated.sku) {
    query += ` AND p.sku = $${paramIndex++}`;
    values.push(validated.sku);
  }

  if (validated.product_id) {
    query += ` AND pi.product_id = $${paramIndex++}`;
    values.push(validated.product_id);
  }

  if (validated.location_id) {
    query += ` AND pi.location_id = $${paramIndex++}`;
    values.push(validated.location_id);
  }

  const result = await pool.query(query, values);
  return { inventory: result.rows };
}

async function createPaymentIntent(params: z.infer<typeof CreatePaymentIntentSchema>) {
  const validated = CreatePaymentIntentSchema.parse(params);
  
  // In a real implementation, this would call Stripe or another payment gateway
  // For now, we'll simulate it
  const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    payment_intent_id: paymentIntentId,
    amount: validated.amount,
    status: 'requires_payment_method',
    client_secret: `secret_${paymentIntentId}`,
  };
}

async function createOrder(params: z.infer<typeof CreateOrderSchema>) {
  const validated = CreateOrderSchema.parse(params);
  
  // Get cart items
  const cartResult = await pool.query(
    'SELECT ci.*, p.name, p.sku FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
    [validated.cart_id]
  );
  
  if (cartResult.rows.length === 0) {
    throw new Error('Cart is empty');
  }

  const totalAmount = cartResult.rows.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  // Create order
  const orderResult = await pool.query(
    `INSERT INTO orders (user_id, cart_id, total_amount, payment_status, status)
     VALUES ($1, $2, $3, $4, 'confirmed')
     RETURNING *`,
    [validated.user_id, validated.cart_id, totalAmount, validated.payment_id ? 'completed' : 'pending']
  );

  const order = orderResult.rows[0];

  // Create order items
  for (const item of cartResult.rows) {
    await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
      [order.id, item.product_id, item.quantity, item.unit_price]
    );
  }

  // Update cart status
  await pool.query('UPDATE carts SET status = $1 WHERE id = $2', ['completed', validated.cart_id]);

  return { order: order };
}

async function getLoyaltySummary(params: z.infer<typeof GetLoyaltySummarySchema>) {
  const validated = GetLoyaltySummarySchema.parse(params);
  
  const result = await pool.query(
    'SELECT * FROM loyalty_accounts WHERE user_id = $1',
    [validated.user_id]
  );

  if (result.rows.length === 0) {
    // Create a new loyalty account
    const newAccount = await pool.query(
      'INSERT INTO loyalty_accounts (user_id) VALUES ($1) RETURNING *',
      [validated.user_id]
    );
    return { loyalty: newAccount.rows[0] };
  }

  return { loyalty: result.rows[0] };
}

async function applyOffer(params: z.infer<typeof ApplyOfferSchema>) {
  const validated = ApplyOfferSchema.parse(params);
  
  // Get cart total
  const cartResult = await pool.query(
    'SELECT SUM(ci.quantity * ci.unit_price) as total FROM cart_items ci WHERE ci.cart_id = $1',
    [validated.cart_id]
  );
  
  const cartTotal = parseFloat(cartResult.rows[0].total || '0');

  // Find applicable offers
  const offersResult = await pool.query(
    `SELECT * FROM offers 
     WHERE is_active = true 
     AND start_at <= NOW() 
     AND end_at >= NOW()
     AND min_cart_value <= $1
     ORDER BY discount_value DESC
     LIMIT 1`,
    [cartTotal]
  );

  if (offersResult.rows.length === 0) {
    return { offer_applied: null, discount: 0 };
  }

  const offer = offersResult.rows[0];
  let discount = 0;

  if (offer.discount_type === 'percentage') {
    discount = cartTotal * (offer.discount_value / 100);
  } else if (offer.discount_type === 'fixed') {
    discount = offer.discount_value;
  }

  return {
    offer_applied: offer,
    discount: discount,
    final_amount: cartTotal - discount,
  };
}

async function getOrderStatus(params: z.infer<typeof GetOrderStatusSchema>) {
  const validated = GetOrderStatusSchema.parse(params);
  
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [validated.order_id]);
  
  if (orderResult.rows.length === 0) {
    throw new Error('Order not found');
  }

  const order = orderResult.rows[0];

  // Get fulfillment info
  const fulfillmentResult = await pool.query(
    'SELECT * FROM order_fulfillments WHERE order_id = $1',
    [validated.order_id]
  );

  return {
    order: order,
    fulfillment: fulfillmentResult.rows[0] || null,
  };
}

// Define available tools
const tools: Tool[] = [
  {
    name: 'db_queryProducts',
    description: 'Query products from the database. Supports filtering by category (home_living or electronics), price range, and search query.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['home_living', 'electronics'] },
        price_min: { type: 'number' },
        price_max: { type: 'number' },
        search_query: { type: 'string' },
        limit: { type: 'number', default: 10 },
        offset: { type: 'number', default: 0 },
      },
    },
  },
  {
    name: 'db_getInventory',
    description: 'Get inventory information for products by SKU, product_id, or location_id.',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        product_id: { type: 'string' },
        location_id: { type: 'string' },
      },
    },
  },
  {
    name: 'payments_createPaymentIntent',
    description: 'Create a payment intent for a cart. Returns payment intent ID and client secret.',
    inputSchema: {
      type: 'object',
      properties: {
        cart_id: { type: 'string' },
        user_id: { type: 'string' },
        amount: { type: 'number' },
      },
      required: ['cart_id', 'user_id', 'amount'],
    },
  },
  {
    name: 'orders_createOrder',
    description: 'Create an order from a cart. Automatically creates order items and updates cart status.',
    inputSchema: {
      type: 'object',
      properties: {
        cart_id: { type: 'string' },
        user_id: { type: 'string' },
        payment_id: { type: 'string' },
      },
      required: ['cart_id', 'user_id'],
    },
  },
  {
    name: 'loyalty_getSummary',
    description: 'Get loyalty account summary for a user, including points balance and tier.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'loyalty_applyOffer',
    description: 'Find and apply the best available offer to a cart based on cart value and category.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        cart_id: { type: 'string' },
      },
      required: ['user_id', 'cart_id'],
    },
  },
  {
    name: 'support_getOrderStatus',
    description: 'Get order status and fulfillment information including tracking details.',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: { type: 'string' },
      },
      required: ['order_id'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'buyoh-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'db_queryProducts':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await queryProducts(args as any), null, 2),
            },
          ],
        };

      case 'db_getInventory':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getInventory(args as any), null, 2),
            },
          ],
        };

      case 'payments_createPaymentIntent':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createPaymentIntent(args as any), null, 2),
            },
          ],
        };

      case 'orders_createOrder':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createOrder(args as any), null, 2),
            },
          ],
        };

      case 'loyalty_getSummary':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getLoyaltySummary(args as any), null, 2),
            },
          ],
        };

      case 'loyalty_applyOffer':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await applyOffer(args as any), null, 2),
            },
          ],
        };

      case 'support_getOrderStatus':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getOrderStatus(args as any), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Buyoh MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

