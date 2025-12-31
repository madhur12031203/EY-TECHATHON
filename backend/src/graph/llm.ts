/**
 * LLM Factory - Creates LLM instances based on configuration
 * Supports Google Gemini (default), OpenAI, and Anthropic
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { config } from '../config';
import { logger } from '../config/logger';

type Provider = 'google' | 'openai';

function pickProvider(modelName?: string): Provider | null {
  const name = (modelName || '').toLowerCase();

  // If caller explicitly asks for gpt/4o, route to OpenAI when possible
  if (name.includes('gpt') || name.includes('4o')) {
    return config.openaiApiKey ? 'openai' : config.googleApiKey ? 'google' : null;
  }

  // If caller explicitly asks for gemini, route to Google when possible
  if (name.includes('gemini')) {
    return config.googleApiKey ? 'google' : config.openaiApiKey ? 'openai' : null;
  }

  // Default preference: Google first, then OpenAI
  if (config.googleApiKey) return 'google';
  if (config.openaiApiKey) return 'openai';

  return null;
}

export function createLLM(modelName?: string, temperature: number = 0.3): BaseChatModel {
  const provider = pickProvider(modelName);

  if (!provider) {
    throw new Error(
      'No LLM API key configured. Please set GOOGLE_API_KEY or OPENAI_API_KEY in your .env file'
    );
  }

  if (provider === 'google') {
    try {
      return new ChatGoogleGenerativeAI({
        modelName: modelName || 'gemini-pro',
        temperature,
        apiKey: config.googleApiKey,
      });
    } catch (error) {
      logger.error('Failed to create Google Gemini LLM:', error);
      throw error;
    }
  }

  // provider === 'openai'
  try {
    return new ChatOpenAI({
      modelName: modelName || 'gpt-4o-mini',
      temperature,
      openAIApiKey: config.openaiApiKey,
    });
  } catch (error) {
    logger.error('Failed to create OpenAI LLM:', error);
    throw error;
  }
}

