import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'awten' | 'white' | 'awten-dark';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  awten: 'border-awten-600',
  white: 'border-white',
  'awten-dark': 'border-awten-dark-600'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'awten',
  className = ''
}) => {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

export const LoadingPage: React.FC<{ message?: string }> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-awten-dark-600">{message}</p>
    </div>
  );
};
