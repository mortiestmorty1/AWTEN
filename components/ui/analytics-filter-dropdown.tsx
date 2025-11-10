'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Button from '@/components/ui/button/button';
import {
  ChartIcon,
  ChevronDownIcon,
  VisitsIcon,
  CreditsIcon,
  CampaignsIcon,
  TrendingUpIcon,
  CalendarIcon
} from '@/components/ui/icons/dashboard';

interface AnalyticsFilterDropdownProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

const filterOptions = [
  { value: 'all', label: 'All Time', icon: 'ChartIcon' },
  { value: '7d', label: 'Last 7 Days', icon: 'CalendarIcon' },
  { value: '30d', label: 'Last 30 Days', icon: 'CalendarIcon' },
  { value: '90d', label: 'Last 90 Days', icon: 'CalendarIcon' },
  { value: '1y', label: 'Last Year', icon: 'TrendingUpIcon' }
];

const metricOptions = [
  { value: 'visits', label: 'Visits', icon: 'VisitsIcon' },
  { value: 'credits', label: 'Credits', icon: 'CreditsIcon' },
  { value: 'campaigns', label: 'Campaigns', icon: 'CampaignsIcon' },
  { value: 'conversion', label: 'Conversion', icon: 'ChartIcon' }
];

export const AnalyticsFilterDropdown: React.FC<
  AnalyticsFilterDropdownProps
> = ({ currentFilter, onFilterChange, className = '' }) => {
  const currentOption =
    filterOptions.find((option) => option.value === currentFilter) ||
    filterOptions[0];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-awten-dark-700">Filters:</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            color="gray"
            variant="outline"
            size="small"
            className="flex items-center space-x-2"
          >
            <ChartIcon className="h-4 w-4" />
            <span>{currentOption.label}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Time Period</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => {
            const IconComponent =
              option.icon === 'CalendarIcon'
                ? CalendarIcon
                : option.icon === 'ChartIcon'
                  ? ChartIcon
                  : option.icon === 'TrendingUpIcon'
                    ? TrendingUpIcon
                    : ChartIcon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={currentFilter === option.value ? 'bg-awten-50' : ''}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
