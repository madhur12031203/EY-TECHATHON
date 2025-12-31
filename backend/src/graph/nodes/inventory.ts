/**
 * Inventory Agent Node - Handles product availability and stock checks
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { INVENTORY_AGENT_PROMPT } from '../prompts';
import { getInventoryTool, queryProductsTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function inventoryNode(state: ConversationState): Promise<Partial<ConversationState>> {
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
      ? (llm as any).bindTools([getInventoryTool, queryProductsTool])
      : llm;

    const systemMsg = new SystemMessage(INVENTORY_AGENT_PROMPT);
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
    let inventoryData: any = null;

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'db_getInventory') {
          const result = await getInventoryTool.invoke(toolCall.args as any);
          inventoryData = JSON.parse(result);
        }
      } catch (error) {
        logger.error('Inventory tool error:', error);
      }
    }

    // Generate response
    let finalResponse: string;
    if (inventoryData) {
      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Inventory data: ${JSON.stringify(inventoryData)}\n\nProvide a clear response about availability.`),
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
      inventory_context: inventoryData ? {
        availability: inventoryData,
      } : state.inventory_context,
      active_worker: 'inventory',
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Inventory agent error:', error);
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: "I'm having trouble checking inventory right now. Please try again in a moment.",
        } as any,
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

