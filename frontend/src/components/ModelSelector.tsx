import React from 'react';
import { Model } from '../utils/api';

interface ModelSelectorProps {
  models: Model[];
  onToggleModel: (modelId: string) => void;
  onClose: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  onToggleModel,
  onClose
}) => {
  const handleModelSelect = (modelId: string) => {
    onToggleModel(modelId);
    onClose();
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 w-80 bg-[#141414] border border-[#1f1f1f] rounded-xl shadow-2xl z-50 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-[#e0e0e0]">Select Model</h3>
          <button 
            onClick={onClose}
            className="text-[#808080] hover:text-[#e0e0e0] transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`w-full p-3 rounded-xl text-left transition-all duration-300 relative overflow-hidden group
                ${model.isSelected 
                  ? 'bg-[#1a1a1a] text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)] ring-1 ring-cyan-500/30' 
                  : 'bg-[#141414] text-[#808080] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]'}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.name}</span>
                  <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300
                    ${model.isSelected 
                      ? 'border-cyan-400 bg-cyan-400/20' 
                      : 'border-[#404040] group-hover:border-[#606060]'}`}
                  />
                </div>
                <p className="text-xs mt-1.5 line-clamp-2 pr-4 opacity-80">
                  {model.description}
                </p>
              </div>
              {model.isSelected && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1),transparent_70%)]"></div>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
