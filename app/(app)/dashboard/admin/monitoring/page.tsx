'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataCard } from '@/components/ui/data-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  ChartIcon,
  ServerIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ActivityIcon,
  HardDriveIcon,
  ShieldIcon
} from '@/components/ui/icons/dashboard';

interface ApplicationMetrics {
  total_users: number;
  total_campaigns: number;
  active_campaigns: number;
  total_visits: number;
  valid_visits: number;
  valid_visit_percentage: number;
  total_credit_transactions: number;
  recent_visits_24h: number;
  recent_valid_visits_24h: number;
  new_users_7d: number;
  completed_campaigns: number;
  completion_rate: number;
  total_credits_allocated: number;
  total_credits_spent: number;
  credits_utilization: number;
  fraud_blocked_today: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  last_check: string;
  uptime: number;
  response_time: number;
}

interface PerformanceData {
  date: string;
  visits: number;
  valid_visits: number;
  valid_percentage: number;
}

export default function SystemMonitoringPage() {
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/monitoring');
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const data = await response.json();

      setMetrics(data.metrics);
      setHealth(data.health);
      setPerformanceData(data.performance_data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load monitoring data'
      );
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!metrics || !health)
    return <ErrorMessage message="No monitoring data available" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Monitoring"
        description="Real-time application performance and health monitoring"
        icon={ChartIcon}
      />

      {/* Application Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="System Status"
          value={health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          subtitle={`${health.uptime}% uptime`}
          icon={
            health.status === 'healthy' ? CheckCircleIcon : AlertTriangleIcon
          }
          color={getHealthColor(health.status)}
        />
        <StatCard
          title="Response Time"
          value={`${health.response_time}ms`}
          subtitle="Average response"
          icon={ClockIcon}
          color={health.response_time > 200 ? 'warning' : 'success'}
        />
        <StatCard
          title="Active Users"
          value={metrics.total_users.toString()}
          subtitle="Total registered"
          icon={ActivityIcon}
          color="info"
        />
        <StatCard
          title="Valid Visits"
          value={`${metrics.valid_visit_percentage.toFixed(1)}%`}
          subtitle="Visit success rate"
          icon={CheckCircleIcon}
          color={metrics.valid_visit_percentage > 80 ? 'success' : 'warning'}
        />
      </div>

      {/* Application Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DataCard
          title="Campaigns"
          value={`${metrics.active_campaigns}/${metrics.total_campaigns}`}
          subtitle="Active campaigns"
          icon={ChartIcon}
        />
        <DataCard
          title="Credits Utilization"
          value={`${metrics.credits_utilization.toFixed(1)}%`}
          subtitle="Credits spent vs allocated"
          icon={ServerIcon}
        />
        <DataCard
          title="Completion Rate"
          value={`${metrics.completion_rate.toFixed(1)}%`}
          subtitle="Campaigns completed"
          icon={HardDriveIcon}
        />
        <DataCard
          title="Fraud Detection"
          value={metrics.fraud_blocked_today.toString()}
          subtitle="Attempts blocked today"
          icon={ShieldIcon}
        />
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Activity Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-awten-dark-600">
                Recent Visits (24h)
              </span>
              <span className="font-semibold text-awten-dark-900">
                {metrics.recent_visits_24h}
              </span>
            </div>
            <div className="w-full bg-awten-dark-200 rounded-full h-2">
              <div
                className="bg-awten-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((metrics.recent_visits_24h / Math.max(metrics.total_visits, 1)) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-awten-dark-600">
                New Users (7d)
              </span>
              <span className="font-semibold text-awten-dark-900">
                {metrics.new_users_7d}
              </span>
            </div>
            <div className="w-full bg-awten-dark-200 rounded-full h-2">
              <div
                className="bg-info-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((metrics.new_users_7d / Math.max(metrics.total_users, 1)) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance History */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Performance History (Last 7 Days)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-awten-dark-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-awten-dark-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-awten-dark-600">
                  Total Visits
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-awten-dark-600">
                  Valid Visits
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-awten-dark-600">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((data, index) => (
                <tr key={index} className="border-b border-awten-dark-100">
                  <td className="py-3 px-4 text-sm text-awten-dark-900">
                    {new Date(data.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-awten-dark-900">
                    {data.visits}
                  </td>
                  <td className="py-3 px-4 text-sm text-awten-dark-900">
                    {data.valid_visits}
                  </td>
                  <td className="py-3 px-4 text-sm text-awten-dark-900">
                    {data.valid_percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
