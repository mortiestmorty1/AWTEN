import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  action,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-awten-dark-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-awten-dark-700 transition-colors duration-200"
                >
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-awten-dark-300">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-awten-100 rounded-lg">
              <Icon className="w-6 h-6 text-awten-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-awten-dark-900">{title}</h1>
            {description && (
              <p className="text-awten-dark-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center space-x-3">{action}</div>}
      </div>
    </div>
  );
};
