/**
 * API Client for communicating with the backend
 */

// Use webpack DefinePlugin or fallback to default
// Webpack DefinePlugin will replace process.env.API_BASE_URL at build time
export const API_BASE_URL: string = 
  typeof process !== 'undefined' && 
  process.env && 
  process.env.API_BASE_URL
    ? process.env.API_BASE_URL
    : 'http://localhost:3001/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  session_id: string;
  state?: {
    intent?: string;
    category?: string;
    active_worker?: string;
  };
}

export async function sendChatMessage(
  message: string,
  userId?: string,
  sessionId?: string,
  channel: 'chat' | 'voice' = 'chat'
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        channel,
        message,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send message';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      
      // Provide helpful error messages
      if (response.status === 0 || response.status === 404) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running on port 3001.`;
      } else if (response.status === 500) {
        errorMessage = 'Backend server error. Check backend logs and ensure database is connected.';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Network errors (CORS, connection refused, etc.)
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. ` +
        `Please ensure:\n` +
        `1. Backend server is running (npm run dev in backend folder)\n` +
        `2. Backend is accessible on port 3001\n` +
        `3. CORS is properly configured\n` +
        `Original error: ${error.message}`
      );
    }
    throw error;
  }
}

export async function getChatHistory(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/chat/history/${conversationId}`);

  if (!response.ok) {
    throw new Error('Failed to load chat history');
  }

  const data = await response.json();
  return data.messages.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }));
}

