
import React from 'react';
import AIChat from '@/components/AIChat';

const AIChatPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F9F9] py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
          <p className="text-gray-600">Get help with your LocalHub experience</p>
        </div>
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;
