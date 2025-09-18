import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'indigo' | 'blue' | 'green' | 'purple';
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'indigo', 
  message 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const colorClasses = {
    indigo: 'text-indigo-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer rotating ring */}
        <svg 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-label="Loading"
          role="status"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="3"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        
        {/* Inner pulsing dot */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`w-2 h-2 ${colorClasses[color].replace('text-', 'bg-')} rounded-full animate-pulse opacity-80`} />
        </div>
      </div>
      
      {message && (
        <div className="text-center">
          <p className="text-gray-600 font-medium animate-pulse">{message}</p>
          <div className="flex space-x-1 justify-center mt-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};
