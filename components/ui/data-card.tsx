import React from 'react';

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
  className = ''
}) => {
  const cardClasses = `
    bg-white rounded-lg border border-awten-dark-200 p-6 
    ${onClick ? 'hover:shadow-md cursor-pointer' : ''} 
    transition-shadow duration-200 ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-awten-dark-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-awten-dark-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-awten-dark-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend.positive ? 'text-success-600' : 'text-error-600'
              }`}
            >
              <span className="font-medium">
                {trend.positive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="ml-1 text-awten-dark-500">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-awten-50 rounded-lg">
            <Icon className="w-6 h-6 text-awten-600" />
          </div>
        )}
      </div>
    </div>
  );
};
