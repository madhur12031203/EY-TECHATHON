/**
 * Tracing and Observability Middleware
 * Logs requests and traces LangGraph execution
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Request tracing middleware
export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = uuidv4();
  req.headers['x-trace-id'] = traceId;
  res.setHeader('X-Trace-Id', traceId);

  const startTime = Date.now();

  // Log request
  logger.info('Request received', {
    traceId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      traceId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

// LangGraph execution tracer
export function traceGraphExecution(
  nodeName: string,
  state: any,
  result: any,
  duration: number,
  error?: Error
) {
  const logData = {
    node: nodeName,
    duration: `${duration}ms`,
    intent: state.intent,
    category: state.category,
    active_worker: state.active_worker,
    channel: state.channel,
    error: error ? error.message : undefined,
  };

  if (error) {
    logger.error('Graph node execution error', logData);
  } else {
    logger.debug('Graph node executed', logData);
  }
}

// Tool call tracer
export function traceToolCall(
  toolName: string,
  args: any,
  result: any,
  duration: number,
  error?: Error
) {
  const logData = {
    tool: toolName,
    args: JSON.stringify(args).substring(0, 200), // Truncate for logging
    duration: `${duration}ms`,
    success: !error,
    error: error ? error.message : undefined,
  };

  if (error) {
    logger.error('Tool call error', logData);
  } else {
    logger.debug('Tool call executed', logData);
  }
}

