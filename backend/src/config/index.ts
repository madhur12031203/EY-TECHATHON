import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  port: z.number().default(3001),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  databaseUrl: z.string().url(),
  googleApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  twilio: z.object({
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    phoneNumber: z.string().optional(),
    webhookUrl: z.string().url().optional(),
  }).optional(),
  mcp: z.object({
    serverPath: z.string().default('./mcp-server/index.ts'),
    transport: z.enum(['stdio', 'http']).default('stdio'),
  }),
  stripe: z.object({
    secretKey: z.string().optional(),
    publishableKey: z.string().optional(),
  }).optional(),
  jwtSecret: z.string().default('change-me-in-production'),
  sessionSecret: z.string().default('change-me-in-production'),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  try {
    return configSchema.parse({
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      databaseUrl: process.env.DATABASE_URL || '',
      googleApiKey: process.env.GOOGLE_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      twilio: process.env.TWILIO_ACCOUNT_SID ? {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
        webhookUrl: process.env.TWILIO_WEBHOOK_URL || '',
      } : undefined,
      mcp: {
        serverPath: process.env.MCP_SERVER_PATH || './mcp-server/index.ts',
        transport: (process.env.MCP_TRANSPORT as 'stdio' | 'http') || 'stdio',
      },
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      },
      jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
      sessionSecret: process.env.SESSION_SECRET || 'change-me-in-production',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
    });
  } catch (error) {
    console.error('Invalid configuration:', error);
    throw new Error('Failed to load configuration');
  }
}

export const config = loadConfig();

