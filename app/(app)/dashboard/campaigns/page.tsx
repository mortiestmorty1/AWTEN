'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/utils/supabase/client';
import {
  PlusIcon,
  CampaignsIcon,
  VisitsIcon,
  CreditsIcon,
  DeviceIcon,
  LocationIcon,
  StarIcon
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
import { CampaignEditDialog } from '@/components/ui/campaign-edit-dialog';
import { CampaignCreateDialog } from '@/components/ui/campaign-create-dialog';
import PremiumUpgradeDialog from '@/components/ui/premium-upgrade-dialog';
import {
  getUserPermissions,
  checkCampaignLimit,
  getUpgradePrompt
} from '@/lib/utils/user-permissions';
import { useAppContext } from '@/contexts/AppContext';

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
  profiles?: {
    username: string;
  };
}

const CampaignCard = ({
  campaign,
  onCampaignUpdate,
  onCampaignDelete
}: {
  campaign: Campaign;
  onCampaignUpdate?: (campaignId: string, updates: Partial<Campaign>) => void;
  onCampaignDelete?: (campaignId: string) => void;
}) => {
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
            {campaign.profiles?.username && (
              <span className="px-2 py-1 text-xs font-medium bg-awten-100 text-awten-700 rounded-full">
                by {campaign.profiles.username}
              </span>
            )}
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
            {campaign.credits_allocated}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
            Credits Spent
          </p>
          <p className="text-lg font-semibold text-awten-dark-900">
            {campaign.credits_spent}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar
          value={progressPercentage}
          max={100}
          label="Progress"
          showPercentage={true}
          color="awten"
          size="md"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-awten-dark-500">
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
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/campaigns/${campaign.id}`}
            className="px-3 py-1 text-sm font-medium text-awten-600 hover:text-awten-700 hover:bg-awten-50 rounded-md transition-colors duration-200"
          >
            View Details
          </Link>
          <CampaignEditDialog
            campaign={campaign}
            onCampaignUpdate={onCampaignUpdate}
            onCampaignDelete={onCampaignDelete}
          >
            <button className="px-3 py-1 text-sm font-medium text-awten-dark-600 hover:text-awten-dark-700 hover:bg-awten-dark-50 rounded-md transition-colors duration-200">
              Edit
            </button>
          </CampaignEditDialog>
        </div>
      </div>
    </div>
  );
};

export default function CampaignsPage() {
  const {
    campaigns,
    profile,
    loading,
    setLoading,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    refreshCampaigns,
    refreshProfile
  } = useAppContext();

  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'active' | 'paused' | 'completed'
  >('all');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([refreshCampaigns(), refreshProfile()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array since functions are now memoized

  // Real-time update functions using context
  const handleCampaignCreate = (newCampaign: any) => {
    addCampaign(newCampaign.campaign);
  };

  const handleCampaignUpdate = (
    campaignId: string,
    updates: Partial<Campaign>
  ) => {
    updateCampaign(campaignId, updates);
  };

  const handleCampaignDelete = (campaignId: string) => {
    deleteCampaign(campaignId);
  };

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
    return <LoadingPage message="Loading campaigns..." />;
  }

  return (
    <div className="space-y-6">
      {/* Upgrade Prompt for Free Users */}
      {profile?.role === 'free' && (
        <div className="bg-gradient-to-r from-awten-600 to-awten-700 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <StarIcon className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Upgrade to Premium</h3>
                <p className="text-sm opacity-90">
                  Get unlimited campaigns, 1.2x credit multiplier, and advanced
                  targeting
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeDialog(true)}
              className="bg-white text-awten-600 px-4 py-2 rounded-lg font-medium hover:bg-awten-50 transition-colors duration-200 w-full sm:w-auto"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Campaigns"
        description={`Manage your traffic campaigns and track their performance${profile?.role === 'free' ? ` (${campaigns.length}/${profile?.campaign_limit || 3} campaigns)` : ''}`}
        icon={CampaignsIcon}
        action={
          profile?.role !== 'admin' ? (
            <CampaignCreateDialog onCampaignCreate={handleCampaignCreate}>
              <button
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 transition-colors duration-200 text-sm sm:text-base"
                disabled={
                  profile?.role === 'free' &&
                  campaigns.length >= (profile?.campaign_limit || 3)
                }
              >
                <PlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Campaign</span>
                <span className="sm:hidden">New</span>
                {profile?.role === 'free' &&
                  campaigns.length >= (profile?.campaign_limit || 3) && (
                    <span className="ml-1 sm:ml-2 text-xs">(Limit)</span>
                  )}
              </button>
            </CampaignCreateDialog>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <CampaignsIcon className="w-8 h-8 text-awten-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-awten-dark-500">Total</p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-success-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-awten-dark-500">Active</p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-warning-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-awten-dark-500">Paused</p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {stats.paused}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-info-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-awten-dark-500">
                Completed
              </p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        options={[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'active', label: 'Active', count: stats.active },
          { key: 'paused', label: 'Paused', count: stats.paused },
          { key: 'completed', label: 'Completed', count: stats.completed }
        ]}
        activeFilter={filter}
        onFilterChange={(filter) => setFilter(filter as any)}
      />

      {/* Campaigns List */}
      {error ? (
        <ErrorMessage title="Error loading campaigns" message={error} />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={CampaignsIcon}
          title={
            filter === 'all' ? 'No campaigns yet' : `No ${filter} campaigns`
          }
          description={
            filter === 'all'
              ? 'Create your first campaign to start driving traffic to your website.'
              : `You don't have any ${filter} campaigns at the moment.`
          }
          action={
            filter === 'all'
              ? {
                  label: 'Create Your First Campaign',
                  onClick: () =>
                    (window.location.href = '/dashboard/campaigns/new'),
                  variant: 'primary' as const
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onCampaignUpdate={handleCampaignUpdate}
              onCampaignDelete={handleCampaignDelete}
            />
          ))}
        </div>
      )}

      {/* Premium Upgrade Dialog */}
      <PremiumUpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgrade={(planId) => {
          console.log('Upgrading to plan:', planId);
          // Dialog will handle the redirect to Stripe
        }}
      />
    </div>
  );
}
