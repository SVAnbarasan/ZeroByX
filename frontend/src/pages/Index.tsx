import React, { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';

const Index: React.FC = () => {
  useEffect(() => {
    console.log('Index component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ChatInterface />
    </div>
  );
};

export default Index;
