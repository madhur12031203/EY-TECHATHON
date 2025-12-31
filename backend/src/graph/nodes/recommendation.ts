/**
 * Recommendation Agent Node - Handles product search, browsing, and recommendations
 */

import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ConversationState } from '../state';
import { RECOMMENDATION_AGENT_PROMPT } from '../prompts';
import { queryProductsTool, getInventoryTool } from '../tools/mcpTools';
import { logger } from '../../config/logger';
import { createLLM } from '../llm';

const incrementTurn = (state: ConversationState) => (state.turn_count || 0) + 1;

export async function recommendationNode(state: ConversationState): Promise<Partial<ConversationState>> {
  const messages = state.messages || [];
  let lastMessage = messages[messages.length - 1] as BaseMessage | any;

  if (!lastMessage) {
    return {
      messages,
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }

  if (typeof (lastMessage as any).getType !== 'function') {
    lastMessage = new HumanMessage((lastMessage as any)?.content ?? String(lastMessage ?? ''));
    messages[messages.length - 1] = lastMessage as any;
  }

  try {
    // Initialize LLM with tools
    const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
    const llm = createLLM(modelName, 0.5);

    const llmWithTools = (llm as any).bindTools
      ? (llm as any).bindTools([queryProductsTool, getInventoryTool])
      : llm;

    // Create system message
    const systemMsg = new SystemMessage(RECOMMENDATION_AGENT_PROMPT);

    // Build context
    const contextMessages = [
      systemMsg,
      ...messages.slice(-10), // More context for recommendations
    ];

    // Add category constraint if specified
    if (state.category) {
      contextMessages.push(
        new HumanMessage(`IMPORTANT: Only show products from the ${state.category} category.`)
      );
    }

    // Get response from LLM
    const response = await llmWithTools.invoke([
      ...contextMessages,
      new HumanMessage(lastMessage.content as string),
    ]);

    // Handle tool calls
    const toolCalls = response.tool_calls || [];
    let toolResults: any[] = [];

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.name === 'db_queryProducts') {
          const result = await queryProductsTool.invoke(toolCall.args);
          toolResults.push({ tool: toolCall.name, result });
        } else if (toolCall.name === 'db_getInventory') {
          const result = await getInventoryTool.invoke(toolCall.args);
          toolResults.push({ tool: toolCall.name, result });
        }
      } catch (error) {
        logger.error(`Tool call error in recommendation agent:`, error);
        toolResults.push({ tool: toolCall.name, error: String(error) });
      }
    }

    // Generate final response with tool results
    let finalResponse: string;
    if (toolResults.length > 0) {
      const toolContext = toolResults.map(tr => 
        `${tr.tool}: ${JSON.stringify(tr.result || tr.error)}`
      ).join('\n');

      const finalMessages = [
        ...contextMessages,
        response,
        new HumanMessage(`Tool results:\n${toolContext}\n\nNow provide a helpful response to the user based on these results.`),
      ];

      const finalLLMResponse = await llm.invoke(finalMessages);
      finalResponse = finalLLMResponse.content as string;
    } else {
      finalResponse = response.content as string;
    }

    // Update state
    return {
      messages: [
        ...messages,
        new AIMessage(finalResponse),
      ],
      active_worker: 'recommendation',
      next: 'orchestrator', // Return to orchestrator after handling
      turn_count: incrementTurn(state),
    };
  } catch (error) {
    logger.error('Recommendation agent error:', error);
    return {
      messages: [
        ...messages,
        new AIMessage("I'm having trouble finding products right now. Could you try rephrasing your request?"),
      ],
      next: 'orchestrator',
      turn_count: incrementTurn(state),
    };
  }
}

