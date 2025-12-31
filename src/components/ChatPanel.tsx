import React, { useRef, useState, useEffect } from 'react';
import { sendChatMessage } from '../api/client';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chat_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', newId);
    return newId;
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    
    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed, undefined, sessionId, 'chat');
      const reply: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.response,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || 'Unknown error'}. Please check if the backend server is running on port 3001.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-landing-panel">
      <div className="chat-input-shell">
        <div className="chat-tools-left">
          <button className="chip-icon" aria-label="Search">🔎</button>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="chat-input-dark"
          placeholder="Ask about Fashion products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
        <div className="chat-tools-right">
          <button className="chip-icon" aria-label="Attach">📎</button>
          <button className="chip-icon" aria-label="Mic">🎙️</button>
          <button 
            className="send-pill" 
            onClick={handleSend} 
            aria-label="Send"
            disabled={isLoading}
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="chat-results">
          {messages.map((m) => (
            <div key={m.id} className={`chat-line ${m.role}`}>
              <div className="chat-bubble-dark">{m.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


