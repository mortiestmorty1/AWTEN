'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataCard } from '@/components/ui/data-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  BanIcon,
  UserIcon
} from '@/components/ui/icons/dashboard';

interface FraudAttempt {
  id: string;
  user_id: string;
  username: string;
  email: string;
  type: 'suspicious_visit' | 'bot_activity' | 'credit_manipulation';
  severity: 'low' | 'medium' | 'critical';
  status: 'reviewed' | 'blocked' | 'false_positive';
  description: string;
  detected_at: string;
  ip_address: string;
  user_agent: string;
  score: number;
}

interface FraudStats {
  totalAttempts: number;
  blockedToday: number;
  falsePositives: number;
  averageScore: number;
}

interface FraudAnalysis {
  totalVisitsAnalyzed: number;
  totalUsersAnalyzed: number;
  totalTransactionsAnalyzed: number;
  suspiciousPatternsFound: number;
}

export default function FraudDetectionPage() {
  const [fraudAttempts, setFraudAttempts] = useState<FraudAttempt[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [analysis, setAnalysis] = useState<FraudAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'false_positive'>(
    'all'
  );

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/fraud');
      if (!response.ok) {
        throw new Error('Failed to fetch fraud data');
      }
      const data = await response.json();

      setFraudAttempts(data.fraudAttempts);
      setStats(data.stats);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load fraud data'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = fraudAttempts.filter((attempt) => {
    if (filter === 'all') return true;
    return attempt.status === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'medium':
        return 'info';
      case 'low':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked':
        return 'error';
      case 'reviewed':
        return 'info';
      case 'false_positive':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'suspicious_visit':
        return 'Suspicious Visit';
      case 'bot_activity':
        return 'Bot Activity';
      case 'credit_manipulation':
        return 'Credit Manipulation';
      default:
        return type;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats)
    return <ErrorMessage message="No fraud detection data available" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Detection"
        description="Monitor and manage fraud attempts and security threats"
        icon={ShieldIcon}
      />

      {/* Analysis Overview */}
      {analysis && (
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
            Analysis Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-awten-primary-600">
                {analysis.totalVisitsAnalyzed}
              </div>
              <div className="text-sm text-awten-dark-600">Visits Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-awten-primary-600">
                {analysis.totalUsersAnalyzed}
              </div>
              <div className="text-sm text-awten-dark-600">Users Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-awten-primary-600">
                {analysis.totalTransactionsAnalyzed}
              </div>
              <div className="text-sm text-awten-dark-600">
                Transactions Analyzed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-awten-warning-600">
                {analysis.suspiciousPatternsFound}
              </div>
              <div className="text-sm text-awten-dark-600">
                Suspicious Patterns
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts.toString()}
          subtitle="All time"
          icon={ShieldIcon}
          color="info"
        />
        <StatCard
          title="Blocked Today"
          value={stats.blockedToday.toString()}
          subtitle="Last 24 hours"
          icon={BanIcon}
          color="error"
        />
        <StatCard
          title="False Positives"
          value={stats.falsePositives.toString()}
          subtitle="Legitimate activity"
          icon={CheckCircleIcon}
          color="info"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Risk assessment"
          icon={AlertTriangleIcon}
          color="info"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-4">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All Attempts' },
            { key: 'blocked', label: 'Blocked' },
            { key: 'false_positive', label: 'False Positives' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-awten-600 text-white'
                  : 'text-awten-dark-600 hover:bg-awten-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Attempts List */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="p-6 border-b border-awten-dark-200">
          <h3 className="text-lg font-semibold text-awten-dark-900">
            Fraud Attempts ({filteredAttempts.length})
          </h3>
        </div>

        <div className="divide-y divide-awten-dark-200">
          {filteredAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="p-6 hover:bg-awten-dark-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-awten-dark-900">
                      {attempt.username}
                    </h4>
                    <StatusBadge status={attempt.severity} />
                    <StatusBadge status={attempt.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-awten-dark-500">Type</p>
                      <p className="font-medium text-awten-dark-900">
                        {getTypeLabel(attempt.type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-awten-dark-500">Risk Score</p>
                      <p className="font-medium text-awten-dark-900">
                        {attempt.score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-awten-dark-500">IP Address</p>
                      <p className="font-medium text-awten-dark-900">
                        {attempt.ip_address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-awten-dark-500">Detected</p>
                      <p className="font-medium text-awten-dark-900">
                        {new Date(attempt.detected_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-awten-dark-600 mb-3">
                    {attempt.description}
                  </p>

                  <div className="text-xs text-awten-dark-400">
                    <p>User Agent: {attempt.user_agent}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-awten-dark-400 hover:text-awten-dark-600 hover:bg-awten-dark-100 rounded-lg transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAttempts.length === 0 && (
          <div className="p-12 text-center">
            <ShieldIcon className="w-12 h-12 text-awten-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
              No fraud attempts found
            </h3>
            <p className="text-awten-dark-600">
              No fraud attempts match the current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
