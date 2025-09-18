import React from 'react';

interface StatusIndicatorProps {
  isAiProcessing: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isAiProcessing }) => {
  if (!isAiProcessing) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30"></div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">AI Processing</h4>
          <p className="text-xs text-gray-500">Enhancing schedule with AI insights...</p>
        </div>
      </div>
      <div className="mt-2 bg-gray-200 rounded-full h-1">
        <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
      </div>
    </div>
  );
};