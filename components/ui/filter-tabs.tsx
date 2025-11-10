import React from 'react';

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps<T = string> {
  options: FilterOption[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  className?: string;
}

export const FilterTabs = <T extends string>({
  options,
  activeFilter,
  onFilterChange,
  className = ''
}: FilterTabsProps<T>) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <span className="text-sm font-medium text-awten-dark-700">Filter:</span>
      <div className="flex space-x-2">
        {options.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key as T)}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeFilter === key
                ? 'bg-awten-600 text-white'
                : 'bg-white text-awten-dark-600 hover:bg-awten-dark-50 border border-awten-dark-200'
            }`}
          >
            {label}
            {count !== undefined && (
              <span className="ml-1 text-xs opacity-75">({count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
