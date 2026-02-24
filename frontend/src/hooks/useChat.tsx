import { useState, useEffect, useCallback } from 'react';
import { Message, Model, models as initialModels, processMessage, endpoints, ModelType } from '../utils/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [models, setModels] = useState<Model[]>(() => {
    console.log('DEBUG - Initializing models state');
    return initialModels;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');

  // Effect to handle command suggestions
  useEffect(() => {
    if (inputMessage === '/') {
      setShowCommandSuggestions(true);
    } else if (!inputMessage.startsWith('/')) {
      setShowCommandSuggestions(false);
    }
  }, [inputMessage]);

  // Debug logging for model selection
  useEffect(() => {
    const selectedModel = models.find(model => model.isSelected);
    console.log('Selected model:', selectedModel?.id);
  }, [models]);

  // Get selected model
  const getSelectedModel = useCallback(() => {
    const selected = models.find(model => model.isSelected);
    console.log('DEBUG - Selected model:', selected?.id);
    return selected?.id || 'theta';
  }, [models]);

  // Toggle model selection
  const toggleModelSelection = useCallback((modelId: string) => {
    console.log('DEBUG - toggleModelSelection called with modelId:', modelId);
    
    setModels(prevModels => {
      const newModels = prevModels.map(model => ({
        ...model,
        isSelected: model.id === modelId
      }));
      console.log('DEBUG - New models state after toggle:', JSON.stringify(newModels, null, 2));
      return newModels;
    });
  }, []);

  // Toggle search functionality
  const toggleSearch = useCallback(() => {
    setSearchEnabled(prev => !prev);
  }, []);

  // Select a command
  const selectCommand = useCallback((command: string) => {
    setInputMessage(command + ' ');
    setShowCommandSuggestions(false);
  }, []);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsStreaming(true);
    setStreamedResponse('');

    const selectedModelId = getSelectedModel();
    console.log('DEBUG - Using model:', selectedModelId);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      model: selectedModelId
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      // Get the correct endpoint based on the selected model
      const endpoint = endpoints[selectedModelId as ModelType];
      console.log('DEBUG - Using endpoint:', endpoint, 'for model:', selectedModelId);

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          model: selectedModelId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let responseText = '';
      let hasContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            if (content.trim()) {
              hasContent = true;
              responseText += content;
              setStreamedResponse(responseText);
            }
          }
        }
      }

      if (!hasContent) {
        throw new Error('No response received from the model');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        model: selectedModelId
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamedResponse('');
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    showCommandSuggestions,
    setShowCommandSuggestions,
    showModelSelector,
    setShowModelSelector,
    searchEnabled,
    models,
    getSelectedModel,
    toggleModelSelection,
    toggleSearch,
    selectCommand,
    sendMessage,
    isLoading,
    error,
    isStreaming,
    streamedResponse
  };
};
