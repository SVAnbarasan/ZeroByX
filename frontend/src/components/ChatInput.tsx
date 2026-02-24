import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Shield, Brain } from 'lucide-react';
import { CommandSuggestions } from './CommandSuggestions';
import { ModelSelector } from './ModelSelector';
import { Model } from '../utils/api';
import { useChat } from '../hooks/useChat';
import { features } from '../data/features';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isProcessing: boolean;
  showCommandSuggestions: boolean;
  onSelectCommand: (command: string) => void;
  showModelSelector: boolean;
  setShowModelSelector: (show: boolean) => void;
  models: Model[];
  toggleModelSelection: (modelId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isProcessing,
  showCommandSuggestions,
  onSelectCommand,
  showModelSelector,
  setShowModelSelector,
  models,
  toggleModelSelection,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showFeatureList, setShowFeatureList] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useChat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const handleSelectCommand = (command: string) => {
    if (command) {
      onChange(command + ' ');
      inputRef.current?.focus();
    }
    onSelectCommand('');
    setShowFeatures(false);
  };
  
  // Count selected models (for single selection, it will be 1 or 0)
  const selectedModelsCount = models.filter(m => m.isSelected).length;
  
  // Feature list for the popover
  const featureList = [
    "/cve – Get details of a specific CVE: severity, summary, and affected systems.",
    "/exploitdb – Search ExploitDB for public exploits and PoCs.",
    "/ioc – Fetch Indicators of Compromise for malware, tools, or APTs.",
    "/pentest – Provides methodology and tools for penetration testing.",
    "/privsec – Lists privilege escalation techniques for a given OS.",
    "/ir – Incident Response playbook for handling specific threats.",
    "/dfir – Digital Forensics & IR steps for breach investigations.",
    "/soctools – Lists essential SOC tools for monitoring and defense.",
  ];

  return (
    <div className="relative w-full">
      {showCommandSuggestions && (
        <CommandSuggestions 
          inputValue={value} 
          onSelectCommand={handleSelectCommand} 
        />
      )}
      
      {showModelSelector && (
        <ModelSelector 
          models={models}
          onToggleModel={toggleModelSelection}
          onClose={() => setShowModelSelector(false)}
        />
      )}

      {showFeatures && (
        <div className="absolute bottom-16 left-0 w-full max-h-96 overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cyan-400">Security Commands</h3>
              <button
                onClick={() => setShowFeatures(false)}
                className="text-[#808080] hover:text-cyan-400 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature) => (
                <button
                  key={feature.command}
                  className="group flex items-start p-3 text-left rounded-lg transition-all duration-300 hover:bg-[#252525] hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  onClick={() => handleSelectCommand(feature.command)}
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        {feature.command}
                      </span>
                      <Shield className="w-4 h-4 ml-2 text-[#808080] group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <p className="text-sm text-[#808080] group-hover:text-[#e0e0e0] transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showFeatureList && (
        <div className="absolute bottom-16 right-0 w-96 max-w-full bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-cyan-400">Feature Commands</h3>
            <button
              onClick={() => setShowFeatureList(false)}
              className="text-[#808080] hover:text-cyan-400 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="space-y-3 text-sm text-[#e0e0e0] font-mono">
            {featureList.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center border border-[#333] bg-[#1a1a1a] rounded-lg overflow-hidden">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Add a small delay before hiding suggestions to allow for clicking them
            setTimeout(() => {
              onSelectCommand('');
              setShowFeatures(false);
            }, 200);
          }}
          placeholder="Type a message or use / for commands..."
          className="flex-1 min-h-[44px] max-h-[200px] p-2 rounded-lg bg-[#1a1a1a] text-[#e0e0e0] resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 cyber-cursor"
          rows={1}
        />
        
        <div className="flex items-center px-2 space-x-2">
          <button
            onClick={onSend}
            disabled={isProcessing || !value.trim()}
            className="p-2 rounded-full hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed text-[#808080] hover:text-cyan-400 transition-all duration-300"
            aria-label="Send message"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowFeatureList(!showFeatureList)}
            className={`px-3 py-2 rounded-lg bg-[#232323] text-cyan-400 font-semibold hover:bg-[#252525] hover:text-cyan-300 transition-all duration-300 border border-[#333] ${showFeatureList ? 'ring-2 ring-cyan-400' : ''}`}
            aria-label="Show feature list"
            type="button"
          >
            Feature
          </button>
          
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className={`group p-2 rounded-lg relative transition-all duration-300 ${
              showFeatures 
                ? 'bg-cyan-400 text-[#1a1a1a] cyber-glow' 
                : 'bg-[#1a1a1a] text-[#808080] hover:bg-[#252525] hover:text-cyan-400'
            }`}
            aria-label="Show security features"
          >
            <Shield className="w-5 h-5" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_70%)]"></div>
          </button>
          
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className={`p-2 rounded-full hover:bg-[#252525] text-[#808080] hover:text-cyan-400 relative transition-all duration-300 ${
              showModelSelector ? 'glow-effect' : ''
            }`}
            aria-label="Select AI models"
          >
            <Brain className="w-5 h-5" />
            {selectedModelsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-xs rounded-full w-4 h-4 flex items-center justify-center text-[#1a1a1a]">
                {selectedModelsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
