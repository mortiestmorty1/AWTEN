'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { redirect } from 'next/navigation';
import {
  SettingsIcon,
  UserIcon,
  CreditsIcon,
  VisitsIcon,
  CalendarIcon
} from '@/components/ui/icons/dashboard';
// import CustomerPortalForm from '@/components/ui/account-forms/customer-portal-form'; // Commented out - not needed for credit-based system
import EmailForm from '@/components/ui/account-forms/email-form';
import NameForm from '@/components/ui/account-forms/name-form';
import SignOutForm from '@/components/ui/account-forms/signout-form';
import { useConfirmationDialog, useAlertDialog } from '@/components/ui';
import { Button } from '@/components/ui/button';

interface ProfileData {
  id: string;
  username: string;
  country: string | null;
  role: string;
  credits: number;
  total_visits: number;
  // parent_agency: string | null; // Removed - no longer needed
  created_at: string;
  updated_at: string;
}

const countries = [
  'US',
  'CA',
  'GB',
  'AU',
  'DE',
  'FR',
  'IT',
  'ES',
  'NL',
  'SE',
  'NO',
  'DK',
  'FI',
  'JP',
  'KR',
  'CN',
  'IN',
  'BR',
  'MX',
  'AR',
  'CL',
  'CO',
  'PE',
  'VE',
  'ZA',
  'NG',
  'EG',
  'MA',
  'KE',
  'GH',
  'TZ',
  'UG',
  'RW',
  'ET',
  'SD',
  'LY',
  'TN',
  'DZ',
  'SN',
  'CI',
  'BF',
  'ML',
  'NE',
  'TD',
  'CM',
  'CF',
  'CD',
  'AO',
  'ZM',
  'ZW',
  'BW',
  'SZ',
  'LS',
  'MW',
  'MZ',
  'MG',
  'MU',
  'SC',
  'KM',
  'YT',
  'RE',
  'DJ',
  'SO',
  'ER',
  'SS'
];

const roles = [
  {
    value: 'free',
    label: 'Free User',
    description: 'Basic features with limited credits'
  },
  {
    value: 'premium',
    label: 'Premium User',
    description: 'Enhanced features with more credits'
  }
  // { value: 'agency', label: 'Agency', description: 'Manage multiple models and campaigns' }, // Commented out - not in current implementation
  // { value: 'model', label: 'Model', description: 'Earn credits by visiting other websites' }, // Commented out - not in current implementation
];

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    country: ''
  });
  const supabase = createClient();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const { alert, AlertDialog } = useAlertDialog();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          username: data.profile.username || '',
          country: data.profile.country || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role: string) => {
    return (
      roles.find((r) => r.value === role) || {
        value: role,
        label: role,
        description: ''
      }
    );
  };

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
          setError('Failed to cancel subscription: ' + error.message);
        } finally {
          setIsCancelling(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6">
        <h3 className="text-error-800 font-semibold">Error loading profile</h3>
        <p className="text-error-600 mt-1">{error}</p>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.role);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-awten-100 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-awten-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-awten-dark-900">
            Account & Profile
          </h1>
          <p className="text-awten-dark-600">
            Manage your account settings, subscription, and personal information
          </p>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-awten-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-awten-dark-900">
              {profile.username}
            </h2>
            <p className="text-awten-dark-600">{roleInfo.label}</p>
            <p className="text-sm text-awten-dark-500 mt-1">
              {roleInfo.description}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-awten-dark-600">
              <CreditsIcon className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {profile.credits.toLocaleString()}
              </span>
              <span className="text-sm">credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-awten-100 rounded-lg flex items-center justify-center">
              <CreditsIcon className="w-5 h-5 text-awten-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-awten-dark-500">
                Credits Balance
              </p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {profile.credits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <VisitsIcon className="w-5 h-5 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-awten-dark-500">
                Total Visits
              </p>
              <p className="text-2xl font-bold text-awten-dark-900">
                {profile.total_visits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-awten-dark-500">
                Member Since
              </p>
              <p className="text-lg font-bold text-awten-dark-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin-specific Stats */}
      {profile.role === 'admin' && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Administrator Account</h3>
              <p className="text-red-100">
                Full system access and management capabilities
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm text-red-100">Admin Privileges</p>
              <p className="text-lg font-semibold">Full Access</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm text-red-100">User Management</p>
              <p className="text-lg font-semibold">Unlimited</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm text-red-100">System Control</p>
              <p className="text-lg font-semibold">Complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Form */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="px-6 py-4 border-b border-awten-dark-200">
          <h2 className="text-lg font-semibold text-awten-dark-900">
            Profile Information
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <p className="text-success-800">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-error-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-awten-dark-700 mb-2">
                Account Role
              </label>
              <div
                className={`px-3 py-2 border rounded-lg ${
                  profile.role === 'admin'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-awten-dark-50 border-awten-dark-300'
                }`}
              >
                <span
                  className={`font-medium ${
                    profile.role === 'admin'
                      ? 'text-red-900'
                      : 'text-awten-dark-900'
                  }`}
                >
                  {roleInfo.label}
                </span>
                <p
                  className={`text-sm mt-1 ${
                    profile.role === 'admin'
                      ? 'text-red-600'
                      : 'text-awten-dark-500'
                  }`}
                >
                  {roleInfo.description}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-awten-dark-700 mb-2">
                Account ID
              </label>
              <div className="px-3 py-2 bg-awten-dark-50 border border-awten-dark-300 rounded-lg">
                <span className="text-awten-dark-900 font-mono text-sm">
                  {profile.id}
                </span>
              </div>
            </div>
          </div>

          {/* Admin-specific fields */}
          {profile.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-awten-dark-700 mb-2">
                  Admin Status
                </label>
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-900 font-medium">
                    Active Administrator
                  </span>
                  <p className="text-sm text-red-600 mt-1">
                    Full system access granted
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-awten-dark-700 mb-2">
                  Security Level
                </label>
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-900 font-medium">Maximum</span>
                  <p className="text-sm text-red-600 mt-1">
                    All permissions enabled
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Management */}
      {profile.role === 'premium' && (
        <div className="bg-white rounded-lg border border-awten-dark-200">
          <div className="px-6 py-4 border-b border-awten-dark-200">
            <h2 className="text-lg font-semibold text-awten-dark-900">
              Subscription Management
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <h3 className="font-medium text-green-800">Premium Active</h3>
                <p className="text-sm text-green-600">
                  You have access to all premium features
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">1.2x Credit Multiplier</p>
                <p className="text-sm text-green-600">Unlimited Campaigns</p>
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

      {/* Admin Management Section */}
      {profile.role === 'admin' && (
        <div className="bg-white rounded-lg border border-awten-dark-200">
          <div className="px-6 py-4 border-b border-awten-dark-200">
            <h2 className="text-lg font-semibold text-awten-dark-900">
              Administrative Tools
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">
                  System Management
                </h3>
                <p className="text-sm text-red-600 mb-3">
                  Access admin dashboard and system controls
                </p>
                <a
                  href="/dashboard/admin"
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Go to Admin Dashboard
                </a>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  User Management
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                  Manage users, roles, and permissions
                </p>
                <a
                  href="/dashboard/admin/users"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Manage Users
                </a>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">
                ⚠️ Administrator Notice
              </h3>
              <p className="text-sm text-yellow-700">
                You have full administrative access to this system. Please use
                your privileges responsibly and in accordance with system
                policies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div>
        <h2 className="text-xl font-semibold text-awten-dark-900 mb-4">
          Account Actions
        </h2>
        <SignOutForm />
      </div>
      {ConfirmationDialog}
      {AlertDialog}
    </div>
  );
}
