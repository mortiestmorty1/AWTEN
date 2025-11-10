'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import EmailFormClient from '@/components/ui/account-forms/email-form-client';
import NameFormClient from '@/components/ui/account-forms/name-form-client';
import SignOutFormClient from '@/components/ui/account-forms/signout-form-client';
import PageLayoutClient from '@/components/layout/page-layout-client';
import Link from 'next/link';
import {
  CreditsIcon,
  CampaignsIcon,
  VisitsIcon,
  AnalyticsIcon
} from '@/components/ui/icons/dashboard';
import { Button } from '@/components/ui/button';
import { useConfirmationDialog, useAlertDialog } from '@/components/ui';

interface Profile {
  id: string;
  role: string;
  credits: number;
  full_name: string;
  credit_multiplier: number;
  campaign_limit: number;
}

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const { alert, AlertDialog } = useAlertDialog();

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/signin');
        return;
      }

      setUser(user);

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      setIsLoading(false);
    };

    getUserData();
  }, [router]);

  const handleCancelSubscription = async () => {
    confirm({
      title: 'Cancel Premium Subscription',
      description:
        'Are you sure you want to cancel your premium subscription? You will lose access to premium features and your role will be downgraded to free.',
      confirmText: 'Yes, Cancel Subscription',
      cancelText: 'Keep Subscription',
      variant: 'destructive',
      onConfirm: async () => {
        setIsCancelling(true);

        try {
          console.log('🚀 Calling cancel subscription API...');
          const response = await fetch('/api/subscription/cancel', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('📡 API response status:', response.status);
          const result = await response.json();
          console.log('📊 API response data:', result);

          if (!response.ok) {
            throw new Error(result.error || 'Failed to cancel subscription');
          }

          // Refresh the page to show updated profile
          window.location.reload();
        } catch (error: any) {
          console.error('Error cancelling subscription:', error);
          alert({
            title: 'Error',
            description: 'Failed to cancel subscription: ' + error.message,
            variant: 'error'
          });
        } finally {
          setIsCancelling(false);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <PageLayoutClient>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600 mx-auto mb-4"></div>
            <p className="text-awten-dark-600">
              Loading account information...
            </p>
          </div>
        </div>
      </PageLayoutClient>
    );
  }

  if (!user || !profile) {
    return (
      <PageLayoutClient>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-awten-dark-900 mb-4">
            Account Not Found
          </h1>
          <p className="text-awten-dark-600 mb-6">
            Unable to load your account information.
          </p>
          <Button
            onClick={() => router.push('/signin')}
            color="primary"
            size="medium"
            variant="solid"
          >
            Sign In
          </Button>
        </div>
      </PageLayoutClient>
    );
  }

  return (
    <PageLayoutClient>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-awten-dark-900 mb-2">
            Account Settings
          </h1>
          <p className="text-awten-dark-600">
            Manage your account settings, credits, and personal information.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credits Overview */}
            <div className="bg-white rounded-lg border border-awten-dark-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-xl font-semibold text-awten-dark-900">
                  Credits Balance
                </h2>
                <Link
                  href="/dashboard/credits"
                  className="text-awten-600 hover:text-awten-700 font-medium text-sm sm:text-base"
                >
                  Manage Credits
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-awten-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditsIcon className="w-6 h-6 text-awten-600" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-awten-dark-900">
                    {profile.credits || 0}
                  </p>
                  <p className="text-awten-dark-600 text-sm sm:text-base">
                    Available Credits
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h2 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Personal Information
              </h2>
              <div className="space-y-6">
                <NameFormClient
                  userName={profile.full_name ?? ''}
                  onUpdate={(newName) => {
                    setProfile((prev: any) =>
                      prev ? { ...prev, full_name: newName } : null
                    );
                  }}
                />
                <EmailFormClient
                  userEmail={user?.email}
                  onUpdate={(newEmail) => {
                    setUser((prev: any) =>
                      prev ? { ...prev, email: newEmail } : null
                    );
                  }}
                />
              </div>
            </div>

            {/* Subscription Management */}
            {profile.role === 'premium' && (
              <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
                <h2 className="text-xl font-semibold text-awten-dark-900 mb-4">
                  Subscription Management
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-green-800">
                        Premium Active
                      </h3>
                      <p className="text-sm text-green-600">
                        You have access to all premium features
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">
                        {profile.credit_multiplier}x Credit Multiplier
                      </p>
                      <p className="text-sm text-green-600">
                        Unlimited Campaigns
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    color="primary"
                    size="medium"
                    variant="outline"
                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                </div>
              </div>
            )}

            {/* Account Actions */}
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h2 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Account Actions
              </h2>
              <SignOutFormClient />
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/campaigns"
                  className="flex items-center p-3 text-awten-dark-700 hover:bg-awten-50 rounded-lg transition-colors duration-200"
                >
                  <CampaignsIcon className="w-5 h-5 mr-3 text-awten-600" />
                  <span>Manage Campaigns</span>
                </Link>
                <Link
                  href="/dashboard/visits"
                  className="flex items-center p-3 text-awten-dark-700 hover:bg-awten-50 rounded-lg transition-colors duration-200"
                >
                  <VisitsIcon className="w-5 h-5 mr-3 text-awten-600" />
                  <span>View Visits</span>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center p-3 text-awten-dark-700 hover:bg-awten-50 rounded-lg transition-colors duration-200"
                >
                  <AnalyticsIcon className="w-5 h-5 mr-3 text-awten-600" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/dashboard/credits"
                  className="flex items-center p-3 text-awten-dark-700 hover:bg-awten-50 rounded-lg transition-colors duration-200"
                >
                  <CreditsIcon className="w-5 h-5 mr-3 text-awten-600" />
                  <span>Buy Credits</span>
                </Link>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-awten-dark-600">Account Type</span>
                  <span className="font-medium text-awten-dark-900 capitalize">
                    {profile.role || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-awten-dark-600">Member Since</span>
                  <span className="font-medium text-awten-dark-900">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-awten-dark-600">Email Verified</span>
                  <span
                    className={`font-medium ${user.email_confirmed_at ? 'text-success-600' : 'text-warning-600'}`}
                  >
                    {user.email_confirmed_at ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {profile.role === 'premium' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-awten-dark-600">
                        Credit Multiplier
                      </span>
                      <span className="font-medium text-awten-dark-900">
                        {profile.credit_multiplier}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-awten-dark-600">
                        Campaign Limit
                      </span>
                      <span className="font-medium text-awten-dark-900">
                        {profile.campaign_limit === 999
                          ? 'Unlimited'
                          : profile.campaign_limit}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {ConfirmationDialog}
      {AlertDialog}
    </PageLayoutClient>
  );
}
