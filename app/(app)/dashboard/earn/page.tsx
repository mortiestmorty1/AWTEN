'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CreditsIcon,
  ExternalLinkIcon,
  ClockIcon,
  StarIcon
} from '@/components/ui/icons/dashboard';
import { useToast } from '@/components/ui/toasts/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import PremiumUpgradeDialog from '@/components/ui/premium-upgrade-dialog';

interface AvailableCampaign {
  campaign_id: string;
  title: string;
  url: string;
  description: string;
  credits_per_visit: number;
  owner_username: string;
  remaining_credits: number;
}

interface UserProfile {
  credits: number;
  role: 'free' | 'premium' | 'admin';
  credit_multiplier: number;
}

export default function EarnCreditsPage() {
  const {
    availableCampaigns,
    profile,
    loading,
    setLoading,
    updateCredits,
    refreshAvailableCampaigns,
    refreshProfile
  } = useAppContext();

  const [error, setError] = useState<string | null>(null);
  const [visiting, setVisiting] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([refreshAvailableCampaigns(), refreshProfile()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array since functions are now memoized

  const handleVisitCampaign = async (campaignId: string, url: string) => {
    try {
      setVisiting(campaignId);

      // Start tracking the visit immediately
      const visitResponse = await fetch('/api/earn/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          url: url
        })
      });

      if (visitResponse.ok) {
        const visitData = await visitResponse.json();

        // Show success toast with visit count
        toast({
          title: 'Credits Earned!',
          description: `You received ${visitData.credits_earned} credit${visitData.credits_earned !== 1 ? 's' : ''}! ${visitData.message || ''}`,
          variant: 'default'
        });

        // Open the campaign URL in a new tab
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

        if (!newWindow) {
          toast({
            title: 'Popup Blocked',
            description: 'Please allow popups to visit campaigns.',
            variant: 'destructive'
          });
        }

        // Update profile credits immediately
        updateCredits(visitData.credits_earned);

        // Refresh the campaigns list to update visit counts
        refreshAvailableCampaigns();
      } else {
        const errorData = await visitResponse.json();
        if (errorData.already_visited) {
          toast({
            title: 'Visit Limit Reached',
            description:
              errorData.error ||
              'You have reached the maximum number of visits for this campaign.',
            variant: 'destructive'
          });
        } else if (errorData.self_visit) {
          toast({
            title: 'Cannot Visit Own Campaign',
            description: 'You cannot visit your own campaign.',
            variant: 'destructive'
          });
        } else if (errorData.inactive_campaign) {
          toast({
            title: 'Campaign Inactive',
            description: 'This campaign is not active.',
            variant: 'destructive'
          });
        } else if (errorData.no_credits) {
          toast({
            title: 'No Credits Remaining',
            description: 'This campaign has no credits remaining.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: errorData.error,
            variant: 'destructive'
          });
        }
      }
    } catch (err) {
      console.error('Error visiting campaign:', err);
      toast({
        title: 'Error',
        description: 'Failed to start visit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setVisiting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-awten-dark-600 mt-4">
            Loading available campaigns...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Error loading campaigns" message={error} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Earn Credits"
        description="Visit other users' campaigns to earn credits instantly for your own campaigns"
        icon={CreditsIcon}
      />

      {/* User Stats */}
      {profile && (
        <div className="bg-white rounded-lg border border-awten-dark-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="w-12 h-12 bg-awten-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditsIcon className="w-6 h-6 text-awten-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-awten-dark-900">
                  Your Credit Balance
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-awten-600">
                  {profile.credits.toLocaleString()}
                </p>
                <p className="text-sm text-awten-dark-600">
                  {profile.role === 'premium'
                    ? 'Premium User (1.2x multiplier)'
                    : 'Free User'}
                </p>
              </div>
            </div>
            {profile.role === 'free' && (
              <div className="text-center sm:text-right">
                <p className="text-sm text-awten-dark-600 mb-2">
                  Upgrade to Premium
                </p>
                <button
                  onClick={() => setShowUpgradeDialog(true)}
                  className="bg-awten-600 text-white px-4 py-2 rounded-lg hover:bg-awten-700 transition-colors duration-200 w-full sm:w-auto"
                >
                  Get 1.2x Credits
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Campaigns */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="p-6 border-b border-awten-dark-200">
          <h2 className="text-xl font-semibold text-awten-dark-900">
            Available Campaigns
          </h2>
          <p className="text-awten-dark-600 mt-1">
            Visit these campaigns to earn credits instantly. Each click earns
            you credits immediately based on your user level.
          </p>
        </div>

        {availableCampaigns.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CreditsIcon}
              title="No campaigns available"
              description="There are currently no campaigns available to visit. Check back later or create your own campaign to get started."
              action={{
                label: 'Create Campaign',
                onClick: () => (window.location.href = '/dashboard/campaigns'),
                variant: 'primary'
              }}
            />
          </div>
        ) : (
          <div className="divide-y divide-awten-dark-200">
            {availableCampaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="p-6 hover:bg-awten-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-awten-dark-900">
                        {campaign.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-awten-100 text-awten-800">
                        by {campaign.owner_username}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className="text-awten-dark-600 mb-3">
                        {campaign.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-awten-dark-500">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4" />
                        <span>
                          {profile?.role === 'premium'
                            ? '1.2 credits'
                            : '1 credit'}{' '}
                          earned instantly
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ExternalLinkIcon className="w-4 h-4" />
                        <span>Opens in new tab</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-awten-600 font-medium">
                          {campaign.remaining_credits} credits remaining
                        </span>
                      </div>
                      {campaign.visit_count > 0 && (
                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.can_visit
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {campaign.visit_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <div className="text-right">
                      <p className="text-sm text-awten-dark-600">Earn</p>
                      <p className="text-lg font-semibold text-awten-600">
                        {profile?.role === 'premium' ? '1.2' : '1'} credit
                        {profile?.role === 'premium' ? 's' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleVisitCampaign(campaign.campaign_id, campaign.url)
                      }
                      disabled={
                        visiting === campaign.campaign_id || !campaign.can_visit
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        campaign.can_visit
                          ? 'bg-awten-600 text-white hover:bg-awten-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {visiting === campaign.campaign_id ? (
                        <>
                          <LoadingSpinner />
                          <span>Earning Credits...</span>
                        </>
                      ) : !campaign.can_visit ? (
                        <>
                          <span>Max Visits Reached</span>
                        </>
                      ) : (
                        <>
                          <ExternalLinkIcon className="w-4 h-4" />
                          <span>Visit & Earn Instantly</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-awten-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
          How Credit Earning Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-awten-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h4 className="font-semibold text-awten-dark-900 mb-2">
              Click Visit
            </h4>
            <p className="text-sm text-awten-dark-600">
              Click "Visit & Earn" to open the campaign in a new tab
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-awten-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h4 className="font-semibold text-awten-dark-900 mb-2">
              Credits Awarded Instantly
            </h4>
            <p className="text-sm text-awten-dark-600">
              Credits are immediately added to your account - no waiting
              required
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-awten-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h4 className="font-semibold text-awten-dark-900 mb-2">
              Browse & Enjoy
            </h4>
            <p className="text-sm text-awten-dark-600">
              Explore the website and discover new content while earning credits
            </p>
          </div>
        </div>
      </div>

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
