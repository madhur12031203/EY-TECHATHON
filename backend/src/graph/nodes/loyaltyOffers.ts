/**
 * Loyalty & Offers Agent Node - Handles loyalty points and promotional offers
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { LOYALTY_OFFERS_AGENT_PROMPT } from '../prompts';
import { getLoyaltySummaryTool, applyOfferTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function loyaltyOffersNode(state: ConversationState): Promise<Partial<ConversationState>> {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    return {
      messages,
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }

  try {
    const llm = createLLM('gemini-pro', 0.4);

    const llmWithTools = (llm as any).bindTools
      ? (llm as any).bindTools([getLoyaltySummaryTool, applyOfferTool])
      : llm;

    const systemMsg = new SystemMessage(LOYALTY_OFFERS_AGENT_PROMPT);
    const contextMessages = [
      systemMsg,
      ...messages.slice(-8),
    ];

    // Add user context if available
    if (state.user_id) {
      contextMessages.push(
        new HumanMessage(`User ID: ${state.user_id}`)
      );
    }

    const response = await llmWithTools.invoke([
      ...contextMessages,
      new HumanMessage(lastMessage.content as string),
    ]);

    // Handle tool calls
    const toolCalls = response.tool_calls || [];
    let loyaltyData: any = null;
    let offerData: any = null;

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'loyalty_getSummary') {
          const result = await getLoyaltySummaryTool.invoke(toolCall.args as any);
          loyaltyData = JSON.parse(result);
        } else if (toolCall.name === 'loyalty_applyOffer') {
          const result = await applyOfferTool.invoke(toolCall.args as any);
          offerData = JSON.parse(result);
        }
      } catch (error) {
        logger.error('Loyalty tool error:', error);
      }
    }

    // Generate response
    let finalResponse: string;
    if (loyaltyData || offerData) {
      const resultContext = loyaltyData || offerData;
      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Loyalty/Offer data: ${JSON.stringify(resultContext)}\n\nProvide a helpful response about loyalty points or offers.`),
      ];
      const finalLLMResponse = await llm.invoke(finalMessages);
      finalResponse = finalLLMResponse.content as string;
    } else {
      finalResponse = response.content as string;
    }

    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: finalResponse,
        } as any,
      ],
      loyalty: {
        points: loyaltyData?.loyalty?.points_balance || state.loyalty?.points,
        tier: loyaltyData?.loyalty?.tier || state.loyalty?.tier,
        applicable_offers: offerData?.offer_applied ? [offerData.offer_applied] : state.loyalty?.applicable_offers,
      },
      active_worker: 'loyalty_offers',
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Loyalty agent error:', error);
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: "I'm having trouble accessing your loyalty information right now. Please try again.",
        } as any,
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

