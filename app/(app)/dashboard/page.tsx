'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/utils/supabase/client';
import {
  PlusIcon,
  CampaignsIcon,
  VisitsIcon,
  CreditsIcon,
  AnalyticsIcon
} from '@/components/ui/icons/dashboard';
import {
  StatCard,
  QuickActionCard,
  LoadingPage,
  ErrorMessage
} from '@/components/ui';
import { CreditPurchaseDialog } from '@/components/ui/credit-purchase-dialog';
import { CampaignCreateDialog } from '@/components/ui/campaign-create-dialog';

interface DashboardStats {
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
    valid: number;
    pending: number;
  };
}

interface Profile {
  id: string;
  username: string;
  role: string;
  credits: number;
  total_visits: number;
  // parent_agency: string | null; // Removed - no longer needed
}

interface RecentActivity {
  id: string;
  type: 'campaign' | 'visit' | 'transaction';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch profile data
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        setProfile(profileData.profile);
        setRecentActivities(profileData.recentActivities || []);

        // Check if user is admin and redirect to admin dashboard
        if (profileData.profile?.role === 'admin') {
          router.replace('/dashboard/admin');
          return;
        }

        setStats(profileData.stats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]); // Add router dependency

  if (loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage title="Error loading dashboard" message={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-awten-600 to-awten-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.username}!
        </h1>
        <p className="text-awten-100 mt-1">
          Here's what's happening with your traffic campaigns today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Campaigns"
          value={stats?.campaigns.total || 0}
          subtitle={`${stats?.campaigns.active || 0} active`}
          icon={CampaignsIcon}
          color="awten"
        />
        <StatCard
          title="Total Visits"
          value={stats?.visits?.total || 0}
          subtitle={`${stats?.visits?.valid || 0} valid`}
          icon={VisitsIcon}
          color="success"
        />
        <StatCard
          title="Credits Balance"
          value={profile?.credits || 0}
          subtitle="Available credits"
          icon={CreditsIcon}
          color="info"
        />
        <StatCard
          title="Credits Spent"
          value={stats?.campaigns.totalCreditsSpent || 0}
          subtitle={`${stats?.campaigns.totalCreditsAllocated || 0} allocated`}
          icon={AnalyticsIcon}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampaignCreateDialog
            onCampaignCreate={() => window.location.reload()}
          >
            <QuickActionCard
              title="Create New Campaign"
              description="Start a new traffic campaign to drive visitors to your website"
              icon={PlusIcon}
              color="awten"
            />
          </CampaignCreateDialog>

          <QuickActionCard
            title="View Analytics"
            description="Analyze your campaign performance and visitor insights"
            href="/dashboard/analytics"
            icon={AnalyticsIcon}
            color="info"
          />

          <CreditPurchaseDialog onPurchase={() => window.location.reload()}>
            <QuickActionCard
              title="Buy Credits"
              description="Purchase more credits to fuel your traffic campaigns"
              icon={CreditsIcon}
              color="success"
            />
          </CreditPurchaseDialog>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="px-6 py-4 border-b border-awten-dark-200">
          <h2 className="text-lg font-semibold text-awten-dark-900">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'campaign':
                      return <CampaignsIcon className="w-5 h-5" />;
                    case 'visit':
                      return <VisitsIcon className="w-5 h-5" />;
                    case 'transaction':
                      return <CreditsIcon className="w-5 h-5" />;
                    default:
                      return <CampaignsIcon className="w-5 h-5" />;
                  }
                };

                const getActivityColor = () => {
                  switch (activity.status) {
                    case 'active':
                    case 'valid':
                    case 'earned':
                      return 'text-success-600 bg-success-50';
                    case 'pending':
                      return 'text-warning-600 bg-warning-50';
                    case 'completed':
                    case 'spent':
                      return 'text-info-600 bg-info-50';
                    default:
                      return 'text-awten-dark-600 bg-awten-dark-50';
                  }
                };

                const formatTimeAgo = (timestamp: string) => {
                  const now = new Date();
                  const activityTime = new Date(timestamp);
                  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
                  
                  if (diffInMinutes < 1) return 'Just now';
                  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
                  return `${Math.floor(diffInMinutes / 1440)}d ago`;
                };

                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-awten-dark-100 hover:bg-awten-dark-25 transition-colors">
                    <div className={`p-2 rounded-lg ${getActivityColor()}`}>
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-awten-dark-900 truncate">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-awten-dark-500 ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-awten-dark-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CampaignsIcon className="w-12 h-12 text-awten-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-awten-dark-900 mb-2">
                No recent activity
              </h3>
              <p className="text-awten-dark-500 mb-4">
                Start by creating your first campaign to see activity here.
              </p>
              <CampaignCreateDialog
                onCampaignCreate={() => window.location.reload()}
              >
                <button className="inline-flex items-center px-4 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 transition-colors duration-200">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Campaign
                </button>
              </CampaignCreateDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
