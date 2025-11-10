import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'awten' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  } | null;
  className?: string;
}

const colorClasses = {
  awten: 'bg-awten-50 text-awten-600 border-awten-200',
  success: 'bg-success-50 text-success-600 border-success-200',
  warning: 'bg-warning-50 text-warning-600 border-warning-200',
  error: 'bg-error-50 text-error-600 border-error-200',
  info: 'bg-info-50 text-info-600 border-info-200'
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'awten',
  trend = null,
  className = ''
}) => {
  return (
    <div
      className={`rounded-lg border p-6 hover:shadow-md transition-shadow duration-200 ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
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
              <span className="ml-1 opacity-75">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white bg-opacity-50">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
