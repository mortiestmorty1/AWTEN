import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button/button';

interface QuickActionCardProps {
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'awten' | 'success' | 'warning' | 'error' | 'info';
  external?: boolean;
  className?: string;
}

const colorClasses = {
  awten: 'bg-awten-50 hover:bg-awten-100 text-awten-700 border-awten-200',
  success:
    'bg-success-50 hover:bg-success-100 text-success-700 border-success-200',
  warning:
    'bg-warning-50 hover:bg-warning-100 text-warning-700 border-warning-200',
  error: 'bg-error-50 hover:bg-error-100 text-error-700 border-error-200',
  info: 'bg-info-50 hover:bg-info-100 text-info-700 border-info-200'
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  href,
  onClick,
  icon: Icon,
  color = 'awten',
  external = false,
  className = ''
}) => {
  const cardContent = (
    <div
      className={`block p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[0]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-awten-dark-900">{title}</h3>
          <p className="text-sm text-awten-dark-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  // If onClick is provided, use button instead of link
  if (onClick) {
    return (
      <Button
        onClick={onClick}
        color="gray"
        variant="ghost"
        size="small"
        className={`w-full h-auto p-0 ${colorClasses[color]} hover:shadow-md`}
      >
        {cardContent}
      </Button>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    );
  }

  return <Link href={href || '#'}>{cardContent}</Link>;
};
