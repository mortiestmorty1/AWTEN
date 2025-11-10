'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { CampaignCreateDialog } from '@/components/ui/campaign-create-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { PageHeader } from '@/components/ui/page-header';
import { DataCard } from '@/components/ui/data-card';
import {
  UsersIcon,
  CreditCardIcon,
  ChartIcon,
  TargetIcon,
  ShieldIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from '@/components/ui/icons/dashboard';

interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  totalVisits: number;
  totalCredits: number;
  fraudAttempts: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load admin stats'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return <ErrorMessage message="No admin data available" />;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor system health and manage the platform"
      />

      {/* System Health Alert */}
      {stats.systemHealth.status !== 'healthy' && (
        <div className="bg-awten-warning-50 border border-awten-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-5 w-5 text-awten-warning-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-awten-warning-800">
                System Health Alert
              </h3>
              <p className="text-sm text-awten-warning-700">
                System status: {stats.systemHealth.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="Registered users"
          icon={UsersIcon}
          trend={{ value: 12.5, label: 'vs last month', positive: true }}
        />
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns.toLocaleString()}
          subtitle="Active campaigns"
          icon={TargetIcon}
          trend={{ value: 8.2, label: 'vs last month', positive: true }}
        />
        <StatCard
          title="Total Visits"
          value={stats.totalVisits.toLocaleString()}
          subtitle="All-time visits"
          icon={ChartIcon}
          trend={{ value: 15.3, label: 'vs last month', positive: true }}
        />
        <StatCard
          title="Total Credits"
          value={stats.totalCredits.toLocaleString()}
          subtitle="Credits in circulation"
          icon={CreditCardIcon}
        />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataCard
          title="System Health"
          value={
            stats.systemHealth.status.charAt(0).toUpperCase() +
            stats.systemHealth.status.slice(1)
          }
          subtitle={`${stats.systemHealth.uptime}% uptime`}
          icon={ShieldIcon}
        />
        <DataCard
          title="Fraud Detection"
          value={stats.fraudAttempts.toString()}
          subtitle="Attempts blocked today"
          icon={ShieldIcon}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="User Management"
          description="Manage users and permissions"
          icon={UsersIcon}
          href="/dashboard/admin/users"
        />
        <QuickActionCard
          title="System Monitoring"
          description="Monitor system performance"
          icon={ChartIcon}
          href="/dashboard/admin/monitoring"
        />
        <QuickActionCard
          title="Fraud Detection"
          description="Review fraud attempts"
          icon={ShieldIcon}
          href="/dashboard/admin/fraud"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Recent System Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-4 w-4 text-awten-success-500" />
              <span className="text-awten-dark-700">
                System backup completed successfully
              </span>
            </div>
            <span className="text-sm text-awten-dark-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <AlertTriangleIcon className="h-4 w-4 text-awten-warning-500" />
              <span className="text-awten-dark-700">
                3 fraud attempts detected and blocked
              </span>
            </div>
            <span className="text-sm text-awten-dark-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <TrendingUpIcon className="h-4 w-4 text-awten-primary-500" />
              <span className="text-awten-dark-700">
                New user registration spike detected
              </span>
            </div>
            <span className="text-sm text-awten-dark-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
