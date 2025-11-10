'use client';

import { useState, useEffect } from 'react';
import { VisitsIcon, AnalyticsIcon } from '@/components/ui/icons/dashboard';
import {
  StatusBadge,
  LoadingPage,
  ErrorMessage,
  EmptyState,
  FilterTabs,
  PageHeader,
  DataCard
} from '@/components/ui';

interface Visit {
  id: string;
  campaign_id: string;
  visitor_id: string;
  credits_earned: number;
  created_at: string;
  updated_at: string;
  campaigns?: {
    title: string;
    url: string;
  };
}

const VisitCard = ({ visit }: { visit: Visit }) => {
  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-awten-dark-900 mb-1">
            {visit.campaigns?.title || 'Campaign'}
          </h3>
          {visit.campaigns?.url && (
            <p className="text-sm text-awten-dark-600 mb-2">
              <a
                href={visit.campaigns.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-awten-600 hover:text-awten-700 underline"
              >
                {visit.campaigns.url}
              </a>
            </p>
          )}
        </div>
        <div className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-xs font-medium">
          Completed
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
            Credits Earned
          </p>
          <p className="text-lg font-semibold text-awten-dark-900">
            {visit.credits_earned}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
            Visit Date
          </p>
          <p className="text-sm font-medium text-awten-dark-900">
            {new Date(visit.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-awten-dark-500">
        <span>Visitor ID: {visit.visitor_id.slice(0, 8)}...</span>
        <span>{new Date(visit.created_at).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== 'all') {
          params.append('status', filter);
        }

        const response = await fetch(`/api/visits?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch visits');
        }
        const data = await response.json();
        setVisits(data.visits || []);
        setApiStats(
          data.stats || {
            total: 0,
            totalCreditsEarned: 0,
            recentVisits: 0
          }
        );
      } catch (err) {
        console.error('Error fetching visits:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [filter]);

  const filteredVisits = visits.filter((visit) => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const visitDate = new Date(visit.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return visitDate >= weekAgo;
    }
    return true;
  });

  const [apiStats, setApiStats] = useState({
    total: 0,
    totalCreditsEarned: 0,
    recentVisits: 0
  });

  const stats = {
    total: apiStats.total,
    totalCreditsEarned: apiStats.totalCreditsEarned,
    recentVisits: apiStats.recentVisits
  };

  if (loading) {
    return <LoadingPage message="Loading visits..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Visit History"
        description="Track visits to your campaigns and credits earned"
        icon={VisitsIcon}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DataCard
          title="Total Visits"
          value={stats.total}
          subtitle="All time"
        />
        <DataCard
          title="Credits Earned"
          value={stats.totalCreditsEarned}
          subtitle="From visits"
        />
        <DataCard
          title="Recent Visits"
          value={stats.recentVisits}
          subtitle="Last 7 days"
        />
      </div>

      {/* Filters */}
      <FilterTabs
        options={[
          { key: 'all', label: 'All Visits', count: stats.total },
          { key: 'recent', label: 'Recent', count: stats.recentVisits }
        ]}
        activeFilter={filter}
        onFilterChange={(filter) => setFilter(filter as any)}
      />

      {/* Visits List */}
      {error ? (
        <ErrorMessage title="Error loading visits" message={error} />
      ) : filteredVisits.length === 0 ? (
        <EmptyState
          icon={VisitsIcon}
          title={filter === 'all' ? 'No visits yet' : `No ${filter} visits`}
          description={
            filter === 'all'
              ? 'Start a campaign to begin receiving traffic and see visits here.'
              : `You don't have any ${filter} visits at the moment.`
          }
          action={
            filter === 'all'
              ? {
                  label: 'Create Your First Campaign',
                  onClick: () =>
                    (window.location.href = '/dashboard/campaigns'),
                  variant: 'primary' as const
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVisits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      )}
    </div>
  );
}
