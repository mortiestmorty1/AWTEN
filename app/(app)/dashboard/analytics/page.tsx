'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  AnalyticsIcon,
  CampaignsIcon,
  VisitsIcon,
  CreditsIcon
} from '@/components/ui/icons/dashboard';
import { AnalyticsFilterDropdown } from '@/components/ui/analytics-filter-dropdown';

interface AnalyticsData {
  period: number;
  campaigns: {
    total: number;
    active: number;
    paused: number;
    completed: number;
    totalCreditsAllocated: number;
    totalCreditsSpent: number;
  };
  visits: {
    total: number;
    totalCreditsEarned: number;
    recentVisits: number;
  };
  credits: {
    totalEarned: number;
    totalSpent: number;
    totalPurchased: number;
  };
  dailyStats: Array<{
    date: string;
    visits: number;
    creditsEarned: number;
  }>;
  topCampaigns: Array<{
    id: string;
    title: string;
    visits: number;
    creditsEarned: number;
    creditsSpent: number;
    creditsAllocated: number;
    status: string;
  }>;
  summary: {
    totalCampaigns: number;
    totalVisits: number;
    totalCreditsEarned: number;
    totalCreditsSpent: number;
    totalCreditsPurchased: number;
    currentBalance: number;
    netCredits: number;
  };
}

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

const TopCampaignCard = ({ campaign }: { campaign: any }) => {
  const progressPercentage =
    campaign.creditsAllocated > 0
      ? Math.round((campaign.creditsSpent / campaign.creditsAllocated) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-awten-dark-900 mb-1">
            {campaign.title}
          </h3>
          <p className="text-sm text-awten-dark-500">{campaign.status}</p>
        </div>
        <span className="text-sm font-medium text-awten-600">
          {campaign.creditsEarned} credits
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-awten-dark-500">Total Visits</p>
          <p className="text-lg font-semibold text-awten-dark-900">
            {campaign.visits}
          </p>
        </div>
        <div>
          <p className="text-xs text-awten-dark-500">Credits Earned</p>
          <p className="text-lg font-semibold text-success-600">
            {campaign.creditsEarned}
          </p>
        </div>
      </div>

      <div className="w-full bg-awten-dark-200 rounded-full h-2 mb-2">
        <div
          className="bg-awten-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-awten-dark-500">
        <span>{campaign.creditsSpent} spent</span>
        <span>{campaign.creditsAllocated} allocated</span>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const AnalyticsDailyChart = dynamic(() => import('@/components/ui/analytics-daily-chart'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 animate-pulse rounded-md bg-awten-dark-50" />
    )
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?period=${period}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6">
        <h3 className="text-error-800 font-semibold">
          Error loading analytics
        </h3>
        <p className="text-error-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-awten-dark-900">
            Analytics
          </h1>
          <p className="text-awten-dark-600 mt-1 text-sm sm:text-base">
            Detailed insights into your campaign performance
          </p>
        </div>
        <AnalyticsFilterDropdown
          currentFilter={period}
          onFilterChange={(filter) => setPeriod(filter as '7' | '30' | '90')}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available Credits"
          value={analytics.summary.currentBalance}
          subtitle="All credits you have"
          icon={CreditsIcon}
          color="success"
        />
        <StatCard
          title="Credits Earned"
          value={analytics.summary.totalCreditsEarned || 0}
          subtitle="From visits only"
          icon={AnalyticsIcon}
          color="info"
        />
        <StatCard
          title="Total Visits"
          value={analytics.summary.totalVisits}
          subtitle="All time"
          icon={VisitsIcon}
          color="awten"
        />
        <StatCard
          title="Credits Purchased"
          value={analytics.summary.totalCreditsPurchased || 0}
          subtitle="From payments"
          icon={AnalyticsIcon}
          color="warning"
        />
      </div>

      {/* Credit Breakdown */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Credit Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {analytics.summary.currentBalance}
            </div>
            <div className="text-sm text-awten-dark-500">Available Credits</div>
            <div className="text-xs text-awten-dark-400">
              All credits you have
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info-600">
              {analytics.summary.totalCreditsEarned || 0}
            </div>
            <div className="text-sm text-awten-dark-500">
              Earned from Visits
            </div>
            <div className="text-xs text-awten-dark-400">
              Only from visiting campaigns
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">
              {analytics.summary.totalCreditsPurchased || 0}
            </div>
            <div className="text-sm text-awten-dark-500">Purchased Credits</div>
            <div className="text-xs text-awten-dark-400">
              From payments & premium
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error-600">
              {analytics.summary.totalCreditsSpent || 0}
            </div>
            <div className="text-sm text-awten-dark-500">
              Spent on Campaigns
            </div>
            <div className="text-xs text-awten-dark-400">
              Used for your campaigns
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
            Campaign Stats
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Total Campaigns</span>
              <span className="font-semibold text-awten-dark-900">
                {analytics.campaigns.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Active Campaigns</span>
              <span className="font-semibold text-success-600">
                {analytics.campaigns.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Paused Campaigns</span>
              <span className="font-semibold text-warning-600">
                {analytics.campaigns.paused}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Completed Campaigns</span>
              <span className="font-semibold text-info-600">
                {analytics.campaigns.completed}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
            Credit Usage
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Credits Allocated</span>
              <span className="font-semibold text-awten-dark-900">
                {(
                  analytics.campaigns.totalCreditsAllocated || 0
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Credits Spent</span>
              <span className="font-semibold text-warning-600">
                {(analytics.campaigns.totalCreditsSpent || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Credits Earned</span>
              <span className="font-semibold text-success-600">
                {(analytics.credits.totalEarned || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-awten-dark-600">Credits Purchased</span>
              <span className="font-semibold text-info-600">
                {(analytics.credits.totalPurchased || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Top Performing Campaigns
        </h2>
        {analytics.topCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <CampaignsIcon className="w-12 h-12 text-awten-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-awten-dark-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-awten-dark-500">
              Create your first campaign to see performance analytics here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topCampaigns.map((campaign) => (
              <TopCampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* Daily Stats Chart */
      }
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Daily Performance
        </h2>
        {analytics?.dailyStats && analytics.dailyStats.length > 0 ? (
          <div className="space-y-4">
            <AnalyticsDailyChart stats={analytics.dailyStats} />
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-awten-dark-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-awten-600">
                  {analytics.dailyStats.reduce((sum: number, day: any) => sum + day.visits, 0)}
                </div>
                <div className="text-sm text-awten-dark-500">Total Visits (30 days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {analytics.dailyStats.reduce((sum: number, day: any) => sum + day.creditsEarned, 0)}
                </div>
                <div className="text-sm text-awten-dark-500">Credits Earned (30 days)</div>
              </div>
            </div>
            {/* Recent Days Detail */}
            <div className="pt-4 border-t border-awten-dark-200">
              <h3 className="text-sm font-medium text-awten-dark-900 mb-3">Last 7 Days</h3>
              <div className="space-y-2">
                {analytics.dailyStats.slice(-7).reverse().map((day: any) => (
                  <div key={day.date} className="flex items-center justify-between py-2 px-3 bg-awten-dark-25 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-awten-500 rounded-full"></div>
                      <span className="text-sm font-medium text-awten-dark-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-awten-dark-600">
                      <span>{day.visits} visits</span>
                      <span>{day.creditsEarned} credits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AnalyticsIcon className="w-12 h-12 text-awten-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-awten-dark-900 mb-2">
              No Data Available
            </h3>
            <p className="text-awten-dark-500">
              Start creating campaigns and earning visits to see your daily performance trends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
