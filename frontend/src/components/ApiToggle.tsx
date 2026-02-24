
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const ApiToggle: React.FC = () => {
  const [useRealApi, setUseRealApi] = React.useState(() => {
    return localStorage.getItem('USE_REAL_API') === 'true';
  });
  
  const handleToggleChange = (checked: boolean) => {
    setUseRealApi(checked);
    
    if (checked) {
      localStorage.setItem('USE_REAL_API', 'true');
    } else {
      localStorage.removeItem('USE_REAL_API');
    }
    
    // Reload to apply changes
    window.location.reload();
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="api-mode" 
        checked={useRealApi} 
        onCheckedChange={handleToggleChange} 
      />
      <Label htmlFor="api-mode" className="cursor-pointer text-xs">
        {useRealApi ? '🔗 Connected to Local API' : '🧪 Using Mock Responses'}
      </Label>
    </div>
  );
};

export default ApiToggle;
