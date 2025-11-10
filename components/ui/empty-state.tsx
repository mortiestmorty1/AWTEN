import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const variantClasses = {
  primary: 'bg-awten-600 text-white hover:bg-awten-700',
  secondary:
    'bg-white text-awten-dark-600 hover:bg-awten-dark-50 border border-awten-dark-200'
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-16 h-16 text-awten-dark-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-awten-dark-900 mb-2">{title}</h3>
      <p className="text-awten-dark-500 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
            variantClasses[action.variant || 'primary']
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
