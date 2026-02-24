import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import useChat from '../hooks/useChat';
import { useAuth } from '../integrations/supabase/AuthProvider';
import TypewriterEffect from './TypewriterEffect';
import ModelSelector from './ModelSelector';
import CommandSuggestions from './CommandSuggestions';
import ApiToggle from './ApiToggle';
import { models } from '../utils/api';

const ChatInterface: React.FC = () => {
  const { messages, inputMessage, setInputMessage, isProcessing, sendMessage, setMessages } = useChat();
  const { user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSecurityCommands, setShowSecurityCommands] = useState(false);
  const [selectedModels, setSelectedModels] = useState(models);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const securityCommands = [
    { command: '/cve', description: 'Get details of a specific CVE: severity, summary, and affected systems.' },
    { command: '/exploitdb', description: 'Search ExploitDB for public exploits and PoCs.' },
    { command: '/ioc', description: 'Fetch Indicators of Compromise for malware, tools, or APTs.' },
    { command: '/pentest', description: 'Provides methodology and tools for penetration testing.' },
    { command: '/privsec', description: 'Lists privilege escalation techniques for a given OS.' },
    { command: '/ir', description: 'Incident Response playbook for handling specific threats.' },
    { command: '/dfir', description: 'Digital Forensics & IR steps for breach investigations.' },
    { command: '/soctools', description: 'Lists essential SOC tools for monitoring and defense.' }
  ];

  const handleSecurityCommand = (command: string) => {
    setInputMessage(command + ' ');
    setShowSecurityCommands(false);
    // Focus the input box
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  useEffect(() => {
    console.log('ChatInterface mounted');
    return () => console.log('ChatInterface unmounted');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleResponseProgress = (event: CustomEvent) => {
      const { progress, isComplete } = event.detail;
      setCurrentResponse(progress);
      if (isComplete) {
        setIsStreaming(false);
      }
    };

    window.addEventListener('responseProgress', handleResponseProgress as EventListener);
    return () => {
      window.removeEventListener('responseProgress', handleResponseProgress as EventListener);
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      setIsStreaming(true);
      setCurrentResponse('');
      try {
        await sendMessage(inputMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message to chat
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: new Date()
        }]);
      } finally {
        setIsStreaming(false);
      }
      setInputMessage('');
    }
  }, [inputMessage, isProcessing, sendMessage, setMessages]);

  const handleToggleModel = useCallback((modelId: string) => {
    setSelectedModels(prev => prev.map(model => ({
      ...model,
      isSelected: model.id === modelId
    })));
  }, []);

  const handleCloseModelSelector = useCallback(() => {
    setShowModelSelector(false);
  }, []);

  // Debug rendering
  if (authLoading) {
    console.log('Auth is loading...');
    return (
      <div className="flex flex-col h-screen bg-black items-center justify-center">
        <div className="text-white">Loading authentication...</div>
      </div>
    );
  }

  console.log('Rendering ChatInterface', { 
    hasUser: !!user, 
    messagesCount: messages.length,
    isProcessing 
  });

  const renderMessages = () => {
    return (
      <div className="space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            {msg.role === 'user' ? (
              <div className="flex items-end space-x-2">
                <div className="max-w-[80%] bg-[#1a1a1a] p-4 rounded-2xl shadow-lg">
                  <p className="text-[#e0e0e0] whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-[#1f1f1f] p-1">
                  <img 
                    src="/zbx_logo.png" 
                    alt="ZeroByX" 
                    className="w-full h-full object-cover filter brightness-90"
                    onError={(e) => {
                      console.error('Failed to load logo');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-lg">
                    <p className="text-[#d0d0d0] whitespace-pre-wrap">
                      {isStreaming && msg.id === messages[messages.length - 1]?.id
                        ? currentResponse
                        : msg.content}
                    </p>
                    {isStreaming && msg.id === messages[messages.length - 1]?.id && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-[#808080]">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-[#1f1f1f]">
        <div className="flex-1">
          <ApiToggle />
        </div>
        <div className="flex flex-col items-center">
          <img 
            src="/zbx_logo.png" 
            alt="ZeroByX Logo" 
            className="w-16 h-16 filter brightness-90"
            onError={(e) => {
              console.error('Failed to load logo');
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-4xl font-bold font-sans mt-2 text-[#e0e0e0] tracking-wider">ZeroByX</h1>
        </div>
        <div className="flex-1 flex justify-end items-center">
          {user ? (
            <span className="text-[#808080]">Welcome, {user.email}</span>
          ) : (
            <span className="text-[#808080]">Not logged in</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col items-center bg-[#0f0f0f]">
        <div className="flex-1 overflow-y-auto p-6 w-full max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <img 
                src="/zbx_logo.png" 
                alt="ZeroByX" 
                className="w-32 h-32 filter brightness-90"
                onError={(e) => {
                  console.error('Failed to load logo');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <TypewriterEffect />
              <div className="text-center space-y-4">
                <h2 className="text-[#e0e0e0] text-lg mb-6">Ask anything about cybersecurity or use these commands:</h2>
                
                <div className="grid grid-cols-3 gap-3 mb-8 sm:grid-cols-6">
                  <button
                    onClick={() => sendMessage('/cve')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/cve</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  
                  <button
                    onClick={() => sendMessage('/exploitdb')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/exploitdb</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  
                  <button
                    onClick={() => sendMessage('/apt')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/apt</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  
                  <button
                    onClick={() => sendMessage('/ioc')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/ioc</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  
                  <button
                    onClick={() => sendMessage('/pentest')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/pentest</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  
                  <button
                    onClick={() => sendMessage('/cloudsec')}
                    className="group p-3 bg-[#1a1a1a] text-[#808080] rounded-xl hover:bg-[#252525] hover:text-cyan-400 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">/cloudsec</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            renderMessages()
          )}
        </div>

        {/* Input area */}
        <div className="w-full border-t border-[#1f1f1f] bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto p-6 relative">
            {/* Selected Model Indicator */}
            <div className="absolute -top-12 left-6">
              <div className="flex items-center space-x-2 bg-[#1a1a1a] px-4 py-2 rounded-t-xl border border-[#252525] border-b-0">
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/>
                    <path d="M18 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/>
                    <path d="M4 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
                    <path d="M12 12v10"/>
                  </svg>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#1a1a1a]"></div>
                </div>
                <span className="text-cyan-400 text-sm font-medium">
                  {selectedModels.find(m => m.isSelected)?.name || 'Default Model'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#1a1a1a] text-[#e0e0e0] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#303030] transition-all duration-200 placeholder-[#505050]"
                disabled={isProcessing}
              />
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="group p-4 bg-[#1a1a1a] text-[#808080] rounded-2xl hover:bg-[#252525] hover:text-[#e0e0e0] transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] active:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                  title="Send message"
                >
                  <div className="relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 group-hover:text-cyan-400 group-active:text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#252525] to-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    disabled={isProcessing}
                    className={`group p-4 bg-[#1a1a1a] text-[#808080] rounded-2xl hover:bg-[#252525] hover:text-[#e0e0e0] transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] active:shadow-[0_0_20px_rgba(0,255,255,0.5)] ${showModelSelector ? 'ring-2 ring-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]' : ''}`}
                    title="Select AI model"
                  >
                    <div className="relative z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300 group-hover:text-cyan-400 group-active:text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/>
                        <path d="M18 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/>
                        <path d="M4 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
                        <path d="M12 12v10"/>
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#252525] to-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                  </button>
                  {showModelSelector && (
                    <ModelSelector
                      models={selectedModels}
                      onToggleModel={handleToggleModel}
                      onClose={handleCloseModelSelector}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecurityCommands(!showSecurityCommands)}
                  disabled={isProcessing}
                  className={`group p-4 bg-[#1a1a1a] text-[#808080] rounded-2xl hover:bg-[#252525] hover:text-[#e0e0e0] transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] active:shadow-[0_0_20px_rgba(0,255,255,0.5)] ${showSecurityCommands ? 'ring-2 ring-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]' : ''}`}
                  title="Security Features"
                >
                  <div className="relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300 group-hover:text-cyan-400 group-active:text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#252525] to-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
                </button>
                {showSecurityCommands && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 border border-cyan-500/20 rounded-lg shadow-lg overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      {securityCommands.map((cmd) => (
                        <button
                          key={cmd.command}
                          onClick={() => handleSecurityCommand(cmd.command)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-b-0"
                        >
                          <div className="font-medium text-cyan-400">{cmd.command}</div>
                          <div className="text-sm text-gray-400">{cmd.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default memo(ChatInterface);
