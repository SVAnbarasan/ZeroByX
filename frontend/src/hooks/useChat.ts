import { useState } from 'react';
import * as api from '../utils/api';

interface Message {
  id: number;
  content: string;
  type: 'user' | 'model';
}

const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage: Message = {
      id: Date.now(),
      content: message,
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let response;
      if (message.startsWith('/search')) {
        response = await api.search(message.slice(7).trim());
      } else if (message.startsWith('/seneca')) {
        response = await api.seneca(message.slice(7).trim());
      } else {
        response = await api.chat(message);
      }

      const modelMessage: Message = {
        id: Date.now() + 1,
        content: response.response || response.error || 'No response received',
        type: 'model'
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: 'Error: Could not get response from the server',
        type: 'model'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    sendMessage
  };
};

export default useChat; 