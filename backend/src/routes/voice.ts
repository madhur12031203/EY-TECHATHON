/**
 * Twilio Voice API Routes
 * Handles phone call webhooks and TTS integration
 */

import { Router, Request, Response } from 'express';
import twilio from 'twilio';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { getGraph } from '../graph/graph';
import { createInitialState, ConversationState } from '../graph/state';
import { pool } from '../db/client';
import { config } from '../config';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const twilioClient = config.twilio?.accountSid 
  ? twilio(config.twilio.accountSid, config.twilio.authToken || '')
  : null;

// Helper to convert DB message to LangChain message
function dbMessageToLangChain(msg: any): BaseMessage {
  if (msg.role === 'user') {
    return new HumanMessage(msg.content);
  } else if (msg.role === 'assistant') {
    return new AIMessage(msg.content);
  }
  return new AIMessage(msg.content);
}

// Helper to get or create user from phone number
async function getOrCreateUser(phoneNumber: string): Promise<string> {
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phoneNumber]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (phone) VALUES ($1) RETURNING id',
      [phoneNumber]
    );

    return newUser.rows[0].id;
  } catch (error) {
    logger.error('Error getting/creating user:', error);
    throw error;
  }
}

// POST /api/voice/twilio/webhook - Twilio webhook handler
router.post('/voice/twilio/webhook', async (req: Request, res: Response) => {
  try {
    if (!config.twilio?.accountSid || !twilioClient) {
      logger.error('Twilio not configured');
      const response = new twilio.twiml.VoiceResponse();
      response.say({ voice: 'alice' }, 'Voice service is not configured. Please contact support.');
      response.hangup();
      res.type('text/xml');
      return res.send(response.toString());
    }

    const { CallSid, From, CallStatus, Digits, SpeechResult } = req.body;

    logger.info('Twilio webhook received', { CallSid, From, CallStatus, Digits, SpeechResult });

    // Handle different call statuses
    if (CallStatus === 'ringing' || CallStatus === 'initiated') {
      // Initial call - greet user and gather input
      const response = new twilio.twiml.VoiceResponse();
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        timeout: 10,
        numDigits: 1,
        action: '/api/voice/twilio/webhook',
        method: 'POST',
        speechTimeout: 'auto',
      });
      gather.say({ voice: 'alice' }, 'Hello! Welcome to Buyoh. I specialize in Fashion products. How can I help you today?');
      
      // Fallback if no input
      response.say({ voice: 'alice' }, 'I didn\'t hear anything. Please call back and try again.');
      response.hangup();

      res.type('text/xml');
      return res.send(response.toString());
    }

    // Get user input (speech or DTMF)
    const userInput = SpeechResult || Digits || '';

    if (!userInput) {
      const response = new twilio.twiml.VoiceResponse();
      response.say({ voice: 'alice' }, 'I didn\'t catch that. Could you please repeat?');
      response.redirect({ method: 'POST' }, '/api/voice/twilio/webhook');
      res.type('text/xml');
      return res.send(response.toString());
    }

    // Get or create user
    const userId = await getOrCreateUser(From);

    // Find or create conversation
    let conversationId: string | undefined;
    const convResult = await pool.query(
      'SELECT id FROM conversations WHERE user_id = $1 AND channel = $2 ORDER BY started_at DESC LIMIT 1',
      [userId, 'voice']
    );

    if (convResult.rows.length > 0) {
      conversationId = convResult.rows[0].id;
    } else {
      const newConv = await pool.query(
        'INSERT INTO conversations (user_id, channel, session_id) VALUES ($1, $2, $3) RETURNING id',
        [userId, 'voice', CallSid]
      );
      conversationId = newConv.rows[0].id;
    }

    // Load conversation state
    let state: ConversationState;
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    const messages: BaseMessage[] = messagesResult.rows.map(dbMessageToLangChain);

    state = {
      messages: messages as any,
      channel: 'voice',
      user_id: userId,
      session_id: CallSid,
      conversation_id: conversationId,
      intent: undefined,
      category: undefined,
      cart: [],
      active_worker: 'orchestrator',
      turn_count: 0,
    };

    // Add user message
    const userMessage = new HumanMessage(userInput);
    state.messages = [...state.messages, userMessage as any];

    // Run graph with timeout protection
    const graph = getGraph();
    const GRAPH_TIMEOUT = 10000; // 10 seconds for voice (faster response needed)
    
    const graphPromise = graph.invoke(state, { 
      recursionLimit: 15, // Lower limit for voice calls
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Graph execution timeout')), GRAPH_TIMEOUT);
    });

    const result = await Promise.race([graphPromise, timeoutPromise]);

    // Get assistant response
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

    // Make response voice-friendly (shorter, clearer)
    if (assistantResponse.length > 500) {
      assistantResponse = assistantResponse.substring(0, 497) + '...';
    }

    // Save conversation
    await pool.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [conversationId, userInput, assistantResponse]
    );

    await pool.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId]
    );

    // Generate TwiML response
    const response = new twilio.twiml.VoiceResponse();
    
    // Check if conversation should continue
    if (result.next === 'end' || userInput.toLowerCase().includes('goodbye') || userInput.toLowerCase().includes('bye')) {
      response.say({ voice: 'alice' }, 'Thank you for calling Buyoh. Have a great day!');
      response.hangup();
    } else {
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        timeout: 10,
        numDigits: 1,
        action: '/api/voice/twilio/webhook',
        method: 'POST',
        speechTimeout: 'auto',
      });
      gather.say({ voice: 'alice' }, assistantResponse);
      
      // Fallback
      response.say({ voice: 'alice' }, 'I didn\'t hear anything. Is there anything else I can help you with?');
      response.redirect({ method: 'POST' }, '/api/voice/twilio/webhook');
    }

    res.type('text/xml');
    res.send(response.toString());
  } catch (error: any) {
    logger.error('Twilio webhook error:', error);
    
    const response = new twilio.twiml.VoiceResponse();
    
    if (error.message === 'Graph execution timeout') {
      response.say({ voice: 'alice' }, 'I apologize, but that request took too long. Could you try asking something simpler?');
      response.redirect({ method: 'POST' }, '/api/voice/twilio/webhook');
    } else {
      response.say({ voice: 'alice' }, 'I apologize, but I encountered an error. Please try calling again later.');
      response.hangup();
    }
    
    res.type('text/xml');
    res.send(response.toString());
  }
});

// POST /api/voice/status - Call status callback
router.post('/voice/status', (req: Request, res: Response) => {
  const { CallSid, CallStatus } = req.body;
  logger.info('Call status update', { CallSid, CallStatus });
  res.status(200).send('OK');
});

export default router;