/**
 * Orchestrator Node - Routes user intents to appropriate worker agents
 */

import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { ORCHESTRATOR_PROMPT } from '../prompts';
import { logger } from '../../config/logger';
import { validateCategory } from '../../middleware/guardrails';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function orchestratorNode(state: ConversationState): Promise<Partial<ConversationState>> {
  const messages = state.messages || [];
  let lastMessage = messages[messages.length - 1] as BaseMessage | any;

  // Normalize last message to a HumanMessage if it's a plain object/string
  if (!lastMessage || typeof (lastMessage as any).getType !== 'function') {
    const content = (lastMessage as any)?.content ?? String(lastMessage ?? '');
    lastMessage = new HumanMessage(content);
    messages[messages.length - 1] = lastMessage as any;
  }

  if ((lastMessage as BaseMessage).getType() !== 'human') {
    return { next: 'end', turn_count: incrementTurn(state) };
  }

  try {
    // Initialize LLM (defaults to OpenAI gpt-4o-mini unless overridden via env LLM_MODEL)
    const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
    const llm = createLLM(modelName, 0.3);

    // Create system message with routing instructions
    const systemMsg = new SystemMessage(ORCHESTRATOR_PROMPT);
    
    // Build context from conversation history
    const contextMessages = [
      systemMsg,
      ...messages.slice(-5), // Last 5 messages for context
    ];

    // Classify intent and determine next agent
    const routingPrompt = `Based on the user's message, classify the intent and determine which specialist agent should handle it.

User message: "${lastMessage.content}"

Respond with a JSON object containing:
{
  "intent": "one of: browse, compare, add_to_cart, pay, track_order, loyalty_query, returns, troubleshooting, or other",
  "category": "fashion or null",
  "next_agent": "one of: recommendation, inventory, payment, fulfillment, loyalty_offers, post_purchase, or end",
  "response": "a brief, friendly response to the user (max 2 sentences for voice, max 3 for chat)"
}`;

    const response = await llm.invoke([
      ...contextMessages,
      new HumanMessage(routingPrompt),
    ]);

    // Parse response
    let routingDecision: any;
    try {
      const content = response.content as string;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        routingDecision = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      logger.warn('Failed to parse routing decision, using defaults', error);
      routingDecision = {
        intent: 'browse',
        category: null,
        next_agent: 'recommendation',
        response: "I'll help you find what you're looking for.",
      };
    }

    // Validate and sanitize category
    let category = routingDecision.category;
    if (category && !validateCategory(category)) {
      logger.warn('Orchestrator received invalid category, filtering', { category });
      category = undefined;
    }

    // Update state with routing decision
    const updates: Partial<ConversationState> = {
      intent: routingDecision.intent,
      category: category || undefined,
      active_worker: routingDecision.next_agent || 'recommendation',
      next: routingDecision.next_agent === 'end' ? 'end' : routingDecision.next_agent,
    };

    // Add orchestrator's response to messages
    if (routingDecision.response) {
      updates.messages = [
        ...messages,
        new AIMessage(routingDecision.response),
      ];
    }

    logger.info(`Orchestrator routed to: ${routingDecision.next_agent}`, {
      intent: routingDecision.intent,
      category: routingDecision.category,
    });

    return {
      ...updates,
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Orchestrator node error:', error);
    return {
      active_worker: 'recommendation',
      next: 'recommendation',
      messages: [
        ...messages,
        new AIMessage("I'll help you with that. Let me connect you with our product specialist."),
      ],
      turn_count: incrementTurn(state),
    };
  }
}

