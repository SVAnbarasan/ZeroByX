import React from 'react';
import { Message } from '../utils/api';
import { cn } from '../lib/utils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? 'You' : message.model || 'Assistant'}</span>
        <span className="message-timestamp">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <div 
        className="message-content"
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    </div>
  );
};

export default ChatMessage;
