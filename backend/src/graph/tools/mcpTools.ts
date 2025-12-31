/**
 * MCP Tools wrapped as LangChain tools for use in agents
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { getMCPClient } from '../../mcp/client';
import { logger } from '../../config/logger';

// Tool schemas
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

// Helper function to call MCP tool
async function callMCPTool(toolName: string, args: any): Promise<string> {
  try {
    const client = await getMCPClient();
    const response = await client.callTool({
      name: toolName,
      arguments: args,
    });

    const content = (response as any).content as any;

    if ((response as any).isError) {
      throw new Error(content?.[0]?.text || 'MCP tool error');
    }

    return content?.[0]?.text || '{}';
  } catch (error: any) {
    logger.error(`MCP tool ${toolName} error:`, error);
    throw error;
  }
}

// Create LangChain tools from MCP tools
export const queryProductsTool = new DynamicStructuredTool({
  name: 'db_queryProducts',
  description: 'Query products from the database. Supports filtering by category (home_living or electronics), price range, and search query. Only returns products from home_living or electronics categories.',
  schema: QueryProductsSchema,
  func: async (input) => {
    const result = await callMCPTool('db_queryProducts', input);
    return result;
  },
});

export const getInventoryTool = new DynamicStructuredTool({
  name: 'db_getInventory',
  description: 'Get inventory information for products by SKU, product_id, or location_id. Returns stock levels and availability.',
  schema: GetInventorySchema,
  func: async (input) => {
    const result = await callMCPTool('db_getInventory', input);
    return result;
  },
});

export const createPaymentIntentTool = new DynamicStructuredTool({
  name: 'payments_createPaymentIntent',
  description: 'Create a payment intent for a cart. Returns payment intent ID and client secret for processing payment.',
  schema: CreatePaymentIntentSchema,
  func: async (input) => {
    const result = await callMCPTool('payments_createPaymentIntent', input);
    return result;
  },
});

export const createOrderTool = new DynamicStructuredTool({
  name: 'orders_createOrder',
  description: 'Create an order from a cart. Automatically creates order items and updates cart status. Requires cart_id and user_id.',
  schema: CreateOrderSchema,
  func: async (input) => {
    const result = await callMCPTool('orders_createOrder', input);
    return result;
  },
});

export const getLoyaltySummaryTool = new DynamicStructuredTool({
  name: 'loyalty_getSummary',
  description: 'Get loyalty account summary for a user, including points balance and tier (bronze, silver, gold, platinum).',
  schema: GetLoyaltySummarySchema,
  func: async (input) => {
    const result = await callMCPTool('loyalty_getSummary', input);
    return result;
  },
});

export const applyOfferTool = new DynamicStructuredTool({
  name: 'loyalty_applyOffer',
  description: 'Find and apply the best available offer to a cart based on cart value and category. Returns discount amount and final price.',
  schema: ApplyOfferSchema,
  func: async (input) => {
    const result = await callMCPTool('loyalty_applyOffer', input);
    return result;
  },
});

export const getOrderStatusTool = new DynamicStructuredTool({
  name: 'support_getOrderStatus',
  description: 'Get order status and fulfillment information including tracking details, delivery ETA, and current status.',
  schema: GetOrderStatusSchema,
  func: async (input) => {
    const result = await callMCPTool('support_getOrderStatus', input);
    return result;
  },
});

// Export all tools as an array
export const mcpTools = [
  queryProductsTool,
  getInventoryTool,
  createPaymentIntentTool,
  createOrderTool,
  getLoyaltySummaryTool,
  applyOfferTool,
  getOrderStatusTool,
];

