'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CampaignsIcon,
  VisitsIcon,
  CreditsIcon,
  DeviceIcon,
  LocationIcon,
  UserIcon
} from '@/components/ui/icons/dashboard';
import {
  StatusBadge,
  ProgressBar,
  LoadingPage,
  ErrorMessage,
  EmptyState,
  FilterTabs,
  PageHeader
} from '@/components/ui';

interface Campaign {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  country_target: string | null;
  device_target: string | null;
  credits_allocated: number;
  credits_spent: number;
  status: 'active' | 'paused' | 'completed' | 'deleted';
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    role: string;
  };
}

const AdminCampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const progressPercentage =
    campaign.credits_allocated > 0
      ? Math.round((campaign.credits_spent / campaign.credits_allocated) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-awten-dark-900">
              {campaign.title}
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              by {campaign.profiles.username}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                campaign.profiles.role === 'admin'
                  ? 'bg-red-100 text-red-700'
                  : campaign.profiles.role === 'premium'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {campaign.profiles.role}
            </span>
          </div>
          <p className="text-sm text-awten-dark-600 mb-2">
            <a
              href={campaign.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-awten-600 hover:text-awten-700 underline"
            >
              {campaign.url}
            </a>
          </p>
          {campaign.description && (
            <p className="text-sm text-awten-dark-500 mb-3">
              {campaign.description}
            </p>
          )}
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
            Credits Allocated
          </p>
          <p className="text-lg font-semibold text-awten-dark-900">
            {campaign.credits_allocated.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
            Credits Spent
          </p>
          <p className="text-lg font-semibold text-awten-dark-900">
            {campaign.credits_spent.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-awten-dark-700">
            Progress
          </span>
          <span className="text-sm text-awten-dark-600">
            {progressPercentage}%
          </span>
        </div>
        <ProgressBar value={progressPercentage} className="h-2" />
      </div>

      <div className="flex items-center space-x-4 mb-4 text-sm text-awten-dark-500">
        {campaign.country_target && (
          <div className="flex items-center space-x-1">
            <LocationIcon className="w-4 h-4" />
            <span>{campaign.country_target}</span>
          </div>
        )}
        {campaign.device_target && (
          <div className="flex items-center space-x-1">
            <DeviceIcon className="w-4 h-4" />
            <span>{campaign.device_target}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-awten-dark-500">
          Created: {new Date(campaign.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/campaigns/${campaign.id}`}
            className="px-3 py-1 text-sm font-medium text-awten-600 hover:text-awten-700 hover:bg-awten-50 rounded-md transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'active' | 'paused' | 'completed'
  >('all');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/campaigns');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch campaigns');
        }

        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    paused: campaigns.filter((c) => c.status === 'paused').length,
    completed: campaigns.filter((c) => c.status === 'completed').length
  };

  if (loading) {
    return <LoadingPage message="Loading all campaigns..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="All Campaigns"
        description="Manage and monitor all user campaigns across the platform"
        icon={CampaignsIcon}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-awten-100 rounded-lg flex items-center justify-center">
              <CampaignsIcon className="w-4 h-4 text-awten-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-semibold text-awten-dark-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <VisitsIcon className="w-4 h-4 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                Active
              </p>
              <p className="text-lg font-semibold text-awten-dark-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <VisitsIcon className="w-4 h-4 text-warning-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                Paused
              </p>
              <p className="text-lg font-semibold text-awten-dark-900">
                {stats.paused}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
              <CreditsIcon className="w-4 h-4 text-info-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                Completed
              </p>
              <p className="text-lg font-semibold text-awten-dark-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={filter}
        onFilterChange={setFilter}
        options={[
          { key: 'all', label: 'All Campaigns', count: stats.total },
          { key: 'active', label: 'Active', count: stats.active },
          { key: 'paused', label: 'Paused', count: stats.paused },
          { key: 'completed', label: 'Completed', count: stats.completed }
        ]}
      />

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={CampaignsIcon}
          title="No campaigns found"
          description={`No ${filter === 'all' ? '' : filter + ' '}campaigns match your current filter.`}
        />
      ) : (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <AdminCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
