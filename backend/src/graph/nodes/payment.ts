/**
 * Payment Agent Node - Handles payment processing
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { PAYMENT_AGENT_PROMPT } from '../prompts';
import { createPaymentIntentTool, createOrderTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function paymentNode(state: ConversationState): Promise<Partial<ConversationState>> {
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
    const llm = createLLM('gemini-pro', 0.2);

    const llmWithTools = (llm as any).bindTools
      ? (llm as any).bindTools([createPaymentIntentTool, createOrderTool])
      : llm;

    const systemMsg = new SystemMessage(PAYMENT_AGENT_PROMPT);
    const contextMessages = [
      systemMsg,
      ...messages.slice(-8),
    ];

    // Add cart context if available
    if (state.cart && state.cart.length > 0) {
      contextMessages.push(
        new HumanMessage(`Current cart: ${JSON.stringify(state.cart)}`)
      );
    }

    const response = await llmWithTools.invoke([
      ...contextMessages,
      new HumanMessage(lastMessage.content as string),
    ]);

    // Handle tool calls
    const toolCalls = response.tool_calls || [];
    let paymentResult: any = null;
    let orderResult: any = null;

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'payments_createPaymentIntent') {
          const result = await createPaymentIntentTool.invoke(toolCall.args as any);
          paymentResult = JSON.parse(result);
        } else if (toolCall.name === 'orders_createOrder') {
          const result = await createOrderTool.invoke(toolCall.args as any);
          orderResult = JSON.parse(result);
        }
      } catch (error) {
        logger.error('Payment tool error:', error);
      }
    }

    // Generate response
    let finalResponse: string;
    if (paymentResult || orderResult) {
      const resultContext = paymentResult || orderResult;
      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Result: ${JSON.stringify(resultContext)}\n\nProvide a clear response to the user.`),
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
      payment_status: paymentResult?.status || orderResult?.order?.payment_status || state.payment_status,
      payment_intent_id: paymentResult?.payment_intent_id || state.payment_intent_id,
      order_id: orderResult?.order?.id || state.order_id,
      active_worker: 'payment',
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Payment agent error:', error);
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: "I'm experiencing issues processing your payment. Please try again or contact support.",
        } as any,
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

