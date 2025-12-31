/**
 * Conversation State for LangGraph
 * Shared state that flows through all nodes in the graph
 */

import { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';

export type Category = 'fashion';
export type Channel = 'chat' | 'voice';

export const ConversationStateSchema = z.object({
  // Conversation history
  messages: z.array(z.any()).default([]), // BaseMessage[]
  
  // Safety guard to avoid infinite routing loops
  turn_count: z.number().default(0),
  
  // Channel and session info
  channel: z.enum(['chat', 'voice']).default('chat'),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  conversation_id: z.string().optional(),
  
  // Intent classification
  intent: z.string().optional(), // e.g., 'browse', 'compare', 'add_to_cart', 'pay', 'track_order', 'loyalty_query', 'returns', 'troubleshooting'
  sub_intent: z.string().optional(),
  category: z.enum(['fashion']).optional(),
  
  // Cart context
  cart: z.array(z.object({
    sku: z.string(),
    product_id: z.string(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).default([]),
  cart_id: z.string().optional(),
  
  // Inventory context
  inventory_context: z.object({
    availability: z.record(z.any()).optional(),
    delivery_options: z.array(z.any()).optional(),
  }).optional(),
  
  // Payment and order context
  payment_status: z.string().optional(),
  payment_intent_id: z.string().optional(),
  order_id: z.string().optional(),
  
  // Loyalty context
  loyalty: z.object({
    points: z.number().optional(),
    tier: z.string().optional(),
    applicable_offers: z.array(z.any()).optional(),
  }).optional(),
  
  // Post-purchase context
  post_purchase: z.object({
    return_eligibility: z.boolean().optional(),
    repair_info: z.any().optional(),
    tracking_info: z.any().optional(),
  }).optional(),
  
  // Active worker agent
  active_worker: z.enum([
    'orchestrator',
    'recommendation',
    'inventory',
    'payment',
    'fulfillment',
    'loyalty_offers',
    'post_purchase',
  ]).default('orchestrator'),
  
  // Next action
  next: z.string().optional(),
});

export type ConversationState = z.infer<typeof ConversationStateSchema>;

// Helper function to create initial state
export function createInitialState(
  user_id?: string,
  session_id?: string,
  channel: Channel = 'chat'
): ConversationState {
  return {
    messages: [],
    turn_count: 0,
    channel,
    user_id,
    session_id,
    intent: undefined,
    sub_intent: undefined,
    category: undefined,
    cart: [],
    inventory_context: undefined,
    payment_status: undefined,
    order_id: undefined,
    loyalty: undefined,
    post_purchase: undefined,
    active_worker: 'orchestrator',
    next: undefined,
  };
}

