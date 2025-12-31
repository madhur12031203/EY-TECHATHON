import React from 'react';
import { ChatPanel } from './ChatPanel';

export const ChatLanding: React.FC = () => {
  return (
    <div className="chat-landing">
      <div className="chat-landing-inner">
        <h1 className="chat-brand">buyoh<span className="brand-dot">.ai</span></h1>
        <ChatPanel />
      </div>
    </div>
  );
};


