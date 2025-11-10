'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CampaignsIcon,
  VisitsIcon,
  CreditsIcon,
  AnalyticsIcon,
  PlusIcon
} from '@/components/ui/icons/dashboard';

interface Campaign {
  id: string;
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

interface CampaignStats {
  totalVisits: number;
  validVisits: number;
  invalidVisits: number;
  averageSessionDuration: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = {
    active: 'bg-success-100 text-success-800 border-success-200',
    paused: 'bg-warning-100 text-warning-800 border-warning-200',
    completed: 'bg-info-100 text-info-800 border-info-200',
    deleted: 'bg-error-100 text-error-800 border-error-200'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[status as keyof typeof statusClasses]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'awten',
  trend = null
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'awten' | 'success' | 'warning' | 'error' | 'info';
  trend?: { value: number; label: string; positive: boolean } | null;
}) => {
  const colorClasses = {
    awten: 'bg-awten-50 text-awten-600 border-awten-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    error: 'bg-error-50 text-error-600 border-error-200',
    info: 'bg-info-50 text-info-600 border-info-200'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
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

function CampaignDetailsContent() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('free');
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.profile?.role || 'free');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Campaign not found');
          }
          throw new Error('Failed to fetch campaign details');
        }
        const data = await response.json();
        setCampaign(data.campaign);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignDetails();
    }
  }, [campaignId]);

  const progressPercentage = campaign?.credits_allocated
    ? Math.round((campaign.credits_spent / campaign.credits_allocated) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <CampaignsIcon className="w-16 h-16 text-awten-dark-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-awten-dark-900 mb-2">
          {error || 'Campaign not found'}
        </h3>
        <p className="text-awten-dark-500 mb-6">
          {error ||
            "The campaign you're looking for doesn't exist or you don't have access to it."}
        </p>
        <Link
          href={userRole === 'admin' ? '/dashboard/admin/campaigns' : '/dashboard/campaigns'}
          className="inline-flex items-center px-4 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 transition-colors duration-200"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={userRole === 'admin' ? '/dashboard/admin/campaigns' : '/dashboard/campaigns'}
            className="text-awten-dark-500 hover:text-awten-dark-700 transition-colors duration-200"
          >
            ← Back to Campaigns
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          {userRole !== 'admin' && (
            <Link
              href={`/dashboard/campaigns/${campaign.id}/edit`}
              className="px-4 py-2 text-awten-dark-600 hover:text-awten-dark-700 hover:bg-awten-dark-50 rounded-lg transition-colors duration-200"
            >
              Edit Campaign
            </Link>
          )}
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-awten-dark-900 mb-2">
              {campaign.title}
            </h1>
            <p className="text-awten-dark-600 mb-4">
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
              <p className="text-awten-dark-500 mb-4">{campaign.description}</p>
            )}
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-awten-dark-500 uppercase tracking-wider mb-1">
              Target Country
            </p>
            <p className="text-lg font-semibold text-awten-dark-900">
              {campaign.country_target || 'Any'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-awten-dark-500 uppercase tracking-wider mb-1">
              Target Device
            </p>
            <p className="text-lg font-semibold text-awten-dark-900">
              {campaign.device_target || 'Any'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-awten-dark-500 uppercase tracking-wider mb-1">
              Created
            </p>
            <p className="text-lg font-semibold text-awten-dark-900">
              {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visits"
          value={stats?.totalVisits || 0}
          subtitle="All time"
          icon={VisitsIcon}
          color="awten"
        />
        <StatCard
          title="Credits Spent"
          value={campaign.credits_spent}
          subtitle={`${campaign.credits_allocated} allocated`}
          icon={CreditsIcon}
          color="warning"
        />
        <StatCard
          title="Credits Remaining"
          value={campaign.credits_allocated - campaign.credits_spent}
          subtitle="Available"
          icon={CreditsIcon}
          color="success"
        />
        <StatCard
          title="Progress"
          value={`${Math.round((campaign.credits_spent / campaign.credits_allocated) * 100)}%`}
          subtitle="Campaign usage"
          icon={AnalyticsIcon}
          color="info"
        />
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Campaign Progress
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-awten-dark-600">
            <span>Credits Usage</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-awten-dark-200 rounded-full h-3">
            <div
              className="bg-awten-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-awten-dark-500">
            <span>{campaign.credits_spent} spent</span>
            <span>
              {campaign.credits_allocated - campaign.credits_spent} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRole !== 'admin' && (
            <Link
              href={`/dashboard/campaigns/${campaign.id}/edit`}
              className="flex items-center p-4 bg-awten-50 hover:bg-awten-100 rounded-lg transition-colors duration-200"
            >
              <CampaignsIcon className="w-5 h-5 text-awten-600 mr-3" />
              <span className="font-medium text-awten-dark-900">
                Edit Campaign
              </span>
            </Link>
          )}
          {userRole !== 'admin' && (
            <>
              <Link
                href="/dashboard/visits"
                className="flex items-center p-4 bg-info-50 hover:bg-info-100 rounded-lg transition-colors duration-200"
              >
                <VisitsIcon className="w-5 h-5 text-info-600 mr-3" />
                <span className="font-medium text-awten-dark-900">View Visits</span>
              </Link>
              <Link
                href="/dashboard/credits"
                className="flex items-center p-4 bg-success-50 hover:bg-success-100 rounded-lg transition-colors duration-200"
              >
                <CreditsIcon className="w-5 h-5 text-success-600 mr-3" />
                <span className="font-medium text-awten-dark-900">Buy Credits</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600 mx-auto mb-4"></div>
            <p className="text-awten-dark-600">Loading campaign details...</p>
          </div>
        </div>
      }
    >
      <CampaignDetailsContent />
    </Suspense>
  );
}
