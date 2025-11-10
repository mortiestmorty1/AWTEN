import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  className?: string;
}

const typeClasses = {
  error: 'bg-error-50 border-error-200 text-error-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-info-50 border-info-200 text-info-800'
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  type = 'error',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`rounded-lg border p-6 ${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
