import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './config/logger';
import { tracingMiddleware } from './middleware/tracing';
import { rateLimitMiddleware } from './middleware/guardrails';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import voiceRoutes from './routes/voice';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(tracingMiddleware);
app.use('/api/chat', rateLimitMiddleware(20, 60000)); // 20 requests per minute

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend server is running'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      chat: '/api/chat',
      voice: '/api/voice/twilio/webhook',
      health: '/health'
    },
    features: {
      chat: true,
      voice: !!process.env.TWILIO_ACCOUNT_SID,
      mcp: true
    }
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', voiceRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

export default app;

