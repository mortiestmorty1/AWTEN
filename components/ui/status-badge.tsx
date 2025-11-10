import React from 'react';

interface StatusBadgeProps {
  status:
    | 'active'
    | 'paused'
    | 'completed'
    | 'deleted'
    | 'valid'
    | 'pending'
    | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusClasses = {
  active: 'bg-success-100 text-success-800 border-success-200',
  paused: 'bg-warning-100 text-warning-800 border-warning-200',
  completed: 'bg-info-100 text-info-800 border-info-200',
  deleted: 'bg-error-100 text-error-800 border-error-200',
  valid: 'bg-success-100 text-success-800 border-success-200',
  pending: 'bg-warning-100 text-warning-800 border-warning-200'
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const getStatusClass = (status: string) => {
    return (
      statusClasses[status as keyof typeof statusClasses] ||
      'bg-awten-dark-100 text-awten-dark-800 border-awten-dark-200'
    );
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${getStatusClass(status)} ${sizeClasses[size]} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
};
