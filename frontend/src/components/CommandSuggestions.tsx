import React, { useState, useRef, useEffect } from 'react';
import { features, Feature, filterFeatures } from '../data/features';
import { ChevronRight } from 'lucide-react';

interface CommandSuggestionsProps {
  inputValue: string;
  onSelectCommand: (command: string) => void;
}

export const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({
  inputValue,
  onSelectCommand
}) => {
  const [filteredFeatures, setFilteredFeatures] = useState<Feature[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  
  // Filter features based on input
  useEffect(() => {
    if (inputValue.startsWith('/')) {
      const searchTerm = inputValue.slice(1); // Remove the slash
      const filtered = filterFeatures(searchTerm);
      setFilteredFeatures(filtered.length > 0 ? filtered : features);
      setSelectedIndex(0);
    } else {
      setFilteredFeatures([]);
    }
  }, [inputValue]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredFeatures.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < filteredFeatures.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredFeatures.length) {
            onSelectCommand(filteredFeatures[selectedIndex].command);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onSelectCommand('');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredFeatures, selectedIndex, onSelectCommand]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Group features by category
  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);
  
  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-16 left-0 w-full max-h-64 overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-50"
    >
      <div className="p-2">
        <h3 className="text-sm font-bold mb-2 text-cyan-400">Available Commands</h3>
        
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-[#808080] mb-1">
              {formatCategoryName(category)}
            </h4>
            <div className="space-y-1">
              {categoryFeatures.map((feature, index) => {
                const isSelected = filteredFeatures.indexOf(feature) === selectedIndex;
                return (
                  <button
                    key={feature.command}
                    ref={isSelected ? selectedRef : null}
                    className={`flex w-full items-start px-2 py-1.5 text-left rounded transition-colors ${
                      isSelected 
                        ? 'bg-[#252525] text-cyan-400' 
                        : 'hover:bg-[#252525] hover:text-[#e0e0e0]'
                    }`}
                    onClick={() => onSelectCommand(feature.command)}
                  >
                    <span className="font-mono text-cyan-400 mr-2 flex items-center">
                      {feature.command}
                      {isSelected && <ChevronRight className="w-4 h-4 ml-1" />}
                    </span>
                    <span className="text-sm text-[#808080]">{feature.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandSuggestions;
