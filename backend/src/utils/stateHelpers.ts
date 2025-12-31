/**
 * Helper functions for managing conversation state
 */

import { ConversationState } from '../graph/state';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

/**
 * Convert LangChain messages to simple message format
 */
export function messagesToSimple(messages: any[]): Array<{ role: string; content: string }> {
  return messages.map((msg) => {
    if (msg instanceof HumanMessage || msg.role === 'user') {
      return { role: 'user', content: msg.content || (msg as any).text || '' };
    }
    if (msg instanceof AIMessage || msg.role === 'assistant') {
      return { role: 'assistant', content: msg.content || (msg as any).text || '' };
    }
    return { role: msg.role || 'system', content: msg.content || (msg as any).text || '' };
  });
}

/**
 * Convert simple messages to LangChain format
 */
export function simpleToMessages(messages: Array<{ role: string; content: string }>): any[] {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    }
    return { role: msg.role, content: msg.content };
  });
}

/**
 * Extract last user message from state
 */
export function getLastUserMessage(state: ConversationState): string | null {
  const messages = state.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof HumanMessage || (msg as any).role === 'user') {
      return msg.content || (msg as any).text || null;
    }
  }
  return null;
}

/**
 * Extract last assistant message from state
 */
export function getLastAssistantMessage(state: ConversationState): string | null {
  const messages = state.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || (msg as any).role === 'assistant') {
      return msg.content || (msg as any).text || null;
    }
  }
  return null;
}

