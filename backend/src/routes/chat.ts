/**
 * Chat API Routes
 * Handles web chat requests and streams responses from LangGraph
 */

import { Router, Request, Response } from 'express';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { getGraph } from '../graph/graph';
import { createInitialState, ConversationState } from '../graph/state';
import { pool } from '../db/client';
import { logger } from '../config/logger';
import { validateChatRequest, validateCategory } from '../middleware/guardrails';
import { traceGraphExecution } from '../middleware/tracing';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to convert DB message to LangChain message
function dbMessageToLangChain(msg: any): BaseMessage {
  if (msg.role === 'user') {
    return new HumanMessage(msg.content);
  } else if (msg.role === 'assistant') {
    return new AIMessage(msg.content);
  }
  // For other roles, return AIMessage as fallback
  return new AIMessage(msg.content);
}

// Helper to load conversation state from DB
async function loadConversationState(
  conversationId: string,
  userId?: string
): Promise<ConversationState | null> {
  try {
    const convResult = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (convResult.rows.length === 0) {
      return null;
    }

    const conversation = convResult.rows[0];

    // Load messages
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    const messages: BaseMessage[] = messagesResult.rows.map(dbMessageToLangChain);

    return {
      messages: messages as any,
      channel: conversation.channel,
      user_id: conversation.user_id || userId,
      session_id: conversation.session_id,
      conversation_id: conversationId,
      intent: undefined,
      category: undefined,
      cart: [],
      active_worker: 'orchestrator',
      turn_count: 0,
    };
  } catch (error) {
    logger.error('Error loading conversation state:', error);
    return null;
  }
}

// Helper to save conversation state to DB
async function saveConversationState(
  state: ConversationState,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  try {
    let conversationId = state.conversation_id;

    // Create conversation if it doesn't exist
    if (!conversationId) {
      const convResult = await pool.query(
        `INSERT INTO conversations (user_id, channel, session_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [state.user_id, state.channel, state.session_id || uuidv4()]
      );
      conversationId = convResult.rows[0].id;
    } else {
      // Update last message time
      await pool.query(
        'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
        [conversationId]
      );
    }

    // Save messages
    await pool.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [conversationId, userMessage, assistantMessage]
    );
  } catch (error) {
    logger.error('Error saving conversation state:', error);
  }
}

// POST /api/chat - Main chat endpoint
router.post('/chat', validateChatRequest, async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { user_id, session_id, channel = 'chat', message } = req.body;
    const traceId = req.headers['x-trace-id'] as string || uuidv4();

    logger.info('Chat request received', { traceId, user_id, session_id, channel });

    // Get or create conversation
    let conversationId: string | undefined;
    if (session_id) {
      const convResult = await pool.query(
        'SELECT id FROM conversations WHERE session_id = $1 ORDER BY started_at DESC LIMIT 1',
        [session_id]
      );
      if (convResult.rows.length > 0) {
        conversationId = convResult.rows[0].id;
      }
    }

    // Load or create state
    let state: ConversationState;
    if (conversationId) {
      const loadedState = await loadConversationState(conversationId, user_id);
      if (loadedState) {
        state = { ...loadedState, turn_count: loadedState.turn_count ?? 0 };
      } else {
        state = createInitialState(user_id, session_id, channel);
        state.conversation_id = conversationId;
      }
    } else {
      state = createInitialState(user_id, session_id, channel);
    }

    // Add user message
    const userMessage = new HumanMessage(message);
    state.messages = [...(state.messages || []), userMessage as any];

    // Run graph with tracing and timeout protection
    const graph = getGraph();
    const graphStartTime = Date.now();
    
    // Add timeout to prevent infinite loops
    const GRAPH_TIMEOUT = 30000; // 30 seconds
    const graphPromise = graph.invoke(state, { 
      recursionLimit: 25, // Reduced from 100 to catch loops faster
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Graph execution timeout')), GRAPH_TIMEOUT);
    });

    const result = await Promise.race([graphPromise, timeoutPromise]);
    const graphDuration = Date.now() - graphStartTime;
    
    // Trace execution
    traceGraphExecution(
      result.active_worker || 'orchestrator',
      state,
      result,
      graphDuration
    );

    // Validate category constraint
    if (result.category && !validateCategory(result.category)) {
      logger.warn('Invalid category detected', { category: result.category, traceId });
      // Override to null if invalid
      result.category = undefined;
    }

    // Get assistant response with better error handling
    const assistantMessages = result.messages || [];
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    let assistantResponse = 'I apologize, but I encountered an error.';
    if (lastAssistantMessage) {
      if (typeof lastAssistantMessage === 'string') {
        assistantResponse = lastAssistantMessage;
      } else if (lastAssistantMessage.content) {
        assistantResponse = typeof lastAssistantMessage.content === 'string' 
          ? lastAssistantMessage.content 
          : JSON.stringify(lastAssistantMessage.content);
      }
    }

    // Save conversation
    await saveConversationState(
      { ...result, conversation_id: conversationId || state.conversation_id } as ConversationState,
      message,
      assistantResponse
    );

    const totalDuration = Date.now() - startTime;
    logger.info('Chat request completed', { traceId, totalDuration: `${totalDuration}ms` });

    // Return response
    res.json({
      response: assistantResponse,
      conversation_id: conversationId || state.conversation_id,
      session_id: state.session_id,
      state: {
        intent: result.intent,
        category: result.category,
        active_worker: result.active_worker,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Chat endpoint error:', { 
      error: error.message, 
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Internal server error';
    if (error.message === 'Graph execution timeout') {
      errorMessage = 'Request took too long to process. Please try a simpler query.';
    } else if (error.message.includes('recursion limit')) {
      errorMessage = 'Query too complex. Please try breaking it into smaller parts.';
    }
    
    res.status(500).json({
      error: errorMessage,
      message: error.message,
    });
  }
});

// GET /api/chat/history/:conversation_id - Get conversation history
router.get('/chat/history/:conversation_id', async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.params;

    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversation_id]
    );

    res.json({
      conversation_id,
      messages: messagesResult.rows,
    });
  } catch (error: any) {
    logger.error('History endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;