/**
 * Guardrails Middleware
 * Validates inputs and enforces safety constraints
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';

// Chat request schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
  channel: z.enum(['chat', 'voice']).default('chat'),
});

// Category validation - only allow fashion
export function validateCategory(category: string | undefined): boolean {
  if (!category) return true; // Optional
  return category === 'fashion';
}

// Message content validation - block inappropriate content
const BLOCKED_PATTERNS = [
  /credit\s*card/i,
  /ssn|social\s*security/i,
  /password/i,
  /pin\s*number/i,
];

export function validateMessageContent(message: string): { valid: boolean; reason?: string } {
  // Check length
  if (message.length > 2000) {
    return { valid: false, reason: 'Message too long' };
  }

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      return { valid: false, reason: 'Message contains sensitive information' };
    }
  }

  return { valid: true };
}

// Middleware to validate chat requests
export function validateChatRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = chatRequestSchema.parse(req.body);
    
    // Additional content validation
    const contentCheck = validateMessageContent(validated.message);
    if (!contentCheck.valid) {
      logger.warn('Invalid message content', { reason: contentCheck.reason, message: validated.message.substring(0, 50) });
      return res.status(400).json({ error: contentCheck.reason || 'Invalid message content' });
    }

    req.body = validated;
    next();
  } catch (error: any) {
    logger.warn('Chat request validation failed', { error: error.message });
    res.status(400).json({ error: 'Invalid request format' });
  }
}

// Rate limiting helper (simple in-memory version - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      logger.warn('Rate limit exceeded', { ip: key });
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    record.count++;
    next();
  };
}

