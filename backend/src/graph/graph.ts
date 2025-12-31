/**
 * LangGraph Graph Definition
 * Main graph that orchestrates all agents
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ConversationState, Channel, Category } from './state';
import { orchestratorNode } from './nodes/orchestrator';
import { recommendationNode } from './nodes/recommendation';
import { inventoryNode } from './nodes/inventory';
import { paymentNode } from './nodes/payment';
import { fulfillmentNode } from './nodes/fulfillment';
import { loyaltyOffersNode } from './nodes/loyaltyOffers';
import { postPurchaseNode } from './nodes/postPurchase';
import { logger } from '../config/logger';

// Routing function - prevents infinite loops by checking state changes
function routeToAgent(state: ConversationState): string {
  const next = state.next || state.active_worker || 'orchestrator';
  
  // Hard stop if the graph is looping too much
  if ((state.turn_count || 0) >= 20) {
    logger.warn('Turn count exceeded safe limit, ending conversation', { turn_count: state.turn_count });
    return END;
  }

  logger.debug('Routing decision', { 
    next, 
    active_worker: state.active_worker,
    intent: state.intent 
  });
  
  if (next === 'end' || next === END) {
    return END;
  }

  // Validate next is a known node
  const validNodes = [
    'orchestrator',
    'recommendation',
    'inventory',
    'payment',
    'fulfillment',
    'loyalty_offers',
    'post_purchase'
  ];

  if (!validNodes.includes(next)) {
    logger.warn('Invalid next node, defaulting to orchestrator', { next });
    return 'orchestrator';
  }

  return next;
}

// Create the graph
export function createGraph() {
  // Initialize StateGraph with the ConversationState type
  const workflow = new StateGraph<ConversationState>({
    channels: {
      messages: {
        value: (left: any[], right: any[]) => left.concat(right),
        default: () => [],
      },
      turn_count: {
        value: (left: number, right: number) => Math.max(left || 0, right || 0),
        default: () => 0,
      },
      channel: {
        value: (left: Channel, right: Channel) => right ?? left,
        default: () => 'chat',
      },
      user_id: {
        value: (left: string | undefined, right: string | undefined) => right ?? left,
        default: () => '',
      },
      session_id: {
        value: (left: string | undefined, right: string | undefined) => right ?? left,
        default: () => '',
      },
      conversation_id: {
        value: (left: string | undefined, right: string | undefined) => right ?? left,
        default: () => undefined,
      },
      intent: {
        value: (left: string | undefined, right: string | undefined) => right ?? left,
        default: () => undefined,
      },
      category: {
        value: (left: Category | undefined, right: Category | undefined) => right ?? left,
        default: () => undefined,
      },
      cart: {
        value: (left: any[], right: any[]) => right || left,
        default: () => [],
      },
      active_worker: {
        value: (
          left: ConversationState['active_worker'],
          right: ConversationState['active_worker']
        ) => right ?? left,
        default: () => 'orchestrator',
      },
      next: {
        value: (left: string | undefined, right: string | undefined) => right ?? left,
        default: () => undefined,
      },
    },
  });

  // Add nodes
  (workflow as any).addNode('orchestrator', orchestratorNode as any);
  (workflow as any).addNode('recommendation', recommendationNode as any);
  (workflow as any).addNode('inventory', inventoryNode as any);
  (workflow as any).addNode('payment', paymentNode as any);
  (workflow as any).addNode('fulfillment', fulfillmentNode as any);
  (workflow as any).addNode('loyalty_offers', loyaltyOffersNode as any);
  (workflow as any).addNode('post_purchase', postPurchaseNode as any);

  // Set entry point
  (workflow as any).setEntryPoint('orchestrator');

  // Add conditional edges from orchestrator
  (workflow as any).addConditionalEdges(
    'orchestrator',
    routeToAgent,
    {
      recommendation: 'recommendation',
      inventory: 'inventory',
      payment: 'payment',
      fulfillment: 'fulfillment',
      loyalty_offers: 'loyalty_offers',
      post_purchase: 'post_purchase',
      orchestrator: 'orchestrator', // Allow looping back for clarification
      [END]: END,
    }
  );
  
  // All specialized nodes return to orchestrator
  (workflow as any).addEdge('recommendation', 'orchestrator');
  (workflow as any).addEdge('inventory', 'orchestrator');
  (workflow as any).addEdge('payment', 'orchestrator');
  (workflow as any).addEdge('fulfillment', 'orchestrator');
  (workflow as any).addEdge('loyalty_offers', 'orchestrator');
  (workflow as any).addEdge('post_purchase', 'orchestrator');

  // Compile graph
  const app = workflow.compile();

  logger.info('LangGraph compiled successfully');

  return app;
}

// Export singleton instance
let graphInstance: any = null;

export function getGraph() {
  if (!graphInstance) {
    graphInstance = createGraph();
  }
  return graphInstance!;
}