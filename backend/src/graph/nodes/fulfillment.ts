/**
 * Fulfillment Agent Node - Handles order creation and shipping
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { FULFILLMENT_AGENT_PROMPT } from '../prompts';
import { createOrderTool, getOrderStatusTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function fulfillmentNode(state: ConversationState): Promise<Partial<ConversationState>> {
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
      ? (llm as any).bindTools([createOrderTool, getOrderStatusTool])
      : llm;

    const systemMsg = new SystemMessage(FULFILLMENT_AGENT_PROMPT);
    const contextMessages = [
      systemMsg,
      ...messages.slice(-8),
    ];

    const response = await llmWithTools.invoke([
      ...contextMessages,
      new HumanMessage(lastMessage.content as string),
    ]);

    // Handle tool calls
    const toolCalls = response.tool_calls || [];
    let fulfillmentResult: any = null;

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'orders_createOrder') {
          const result = await createOrderTool.invoke(toolCall.args as any);
          fulfillmentResult = JSON.parse(result);
        } else if (toolCall.name === 'support_getOrderStatus') {
          const result = await getOrderStatusTool.invoke(toolCall.args as any);
          fulfillmentResult = JSON.parse(result);
        }
      } catch (error) {
        logger.error('Fulfillment tool error:', error);
      }
    }

    // Generate response
    let finalResponse: string;
    if (fulfillmentResult) {
      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Fulfillment data: ${JSON.stringify(fulfillmentResult)}\n\nProvide a clear response about order status or creation.`),
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
      order_id: fulfillmentResult?.order?.id || state.order_id,
      active_worker: 'fulfillment',
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Fulfillment agent error:', error);
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: "I'm having trouble processing your order request. Please try again or contact support.",
        } as any,
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

