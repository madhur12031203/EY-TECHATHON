/**
 * Post-Purchase Agent Node - Handles order tracking, returns, and support
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { POST_PURCHASE_AGENT_PROMPT } from '../prompts';
import { getOrderStatusTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function postPurchaseNode(state: ConversationState): Promise<Partial<ConversationState>> {
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
    const llm = createLLM('gemini-pro', 0.3);

    const llmWithTools = (llm as any).bindTools
      ? (llm as any).bindTools([getOrderStatusTool])
      : llm;

    const systemMsg = new SystemMessage(POST_PURCHASE_AGENT_PROMPT);
    const contextMessages = [
      systemMsg,
      ...messages.slice(-8),
    ];

    // Add order context if available
    if (state.order_id) {
      contextMessages.push(
        new HumanMessage(`Order ID: ${state.order_id}`)
      );
    }

    const response = await llmWithTools.invoke([
      ...contextMessages,
      new HumanMessage(lastMessage.content as string),
    ]);

    // Handle tool calls
    const toolCalls = response.tool_calls || [];
    let orderStatusData: any = null;

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'support_getOrderStatus') {
          const result = await getOrderStatusTool.invoke(toolCall.args as any);
          orderStatusData = JSON.parse(result);
        }
      } catch (error) {
        logger.error('Post-purchase tool error:', error);
      }
    }

    // Generate response
    let finalResponse: string;
    if (orderStatusData) {
      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Order status data: ${JSON.stringify(orderStatusData)}\n\nProvide a clear, helpful response about the order status, tracking, or support request.`),
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
      post_purchase: {
        tracking_info: orderStatusData?.fulfillment || state.post_purchase?.tracking_info,
        return_eligibility: orderStatusData?.order?.status === 'delivered' || state.post_purchase?.return_eligibility,
      },
      active_worker: 'post_purchase',
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Post-purchase agent error:', error);
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: "I'm having trouble accessing your order information. Please provide your order ID or contact support.",
        } as any,
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

