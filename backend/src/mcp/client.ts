/**
 * MCP Client - Alternative import patterns
 * Try these if the main version doesn't work
 */

// ===== OPTION 1: For @modelcontextprotocol/sdk@0.5.x =====
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// ===== OPTION 2: For older versions =====
// import { Client } from '@modelcontextprotocol/sdk/client';
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

// ===== OPTION 3: Direct SDK import =====
// import { Client, StdioClientTransport } from '@modelcontextprotocol/sdk';

// ===== OPTION 4: CommonJS style (if using require) =====
// const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
// const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

import { config } from '../config';
import { logger } from '../config/logger';

let mcpClient: Client | null = null;

export async function getMCPClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    // Create transport (StdioClientTransport will spawn the process)
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['ts-node', config.mcp.serverPath],
    });

    // Create client
    mcpClient = new Client(
      {
        name: 'buyoh-langgraph-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(transport);
    logger.info('MCP client connected successfully');

    return mcpClient;
  } catch (error) {
    logger.error('Failed to connect MCP client:', error);
    mcpClient = null;
    throw error;
  }
}

export async function closeMCPClient() {
  if (mcpClient) {
    try {
      await mcpClient.close();
      logger.info('MCP client closed');
    } catch (error) {
      logger.error('Error closing MCP client:', error);
    }
    mcpClient = null;
  }
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing MCP client...');
  await closeMCPClient();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing MCP client...');
  await closeMCPClient();
  process.exit(0);
});