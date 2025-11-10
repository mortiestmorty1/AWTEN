'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { CampaignsIcon, ArrowLeftIcon } from '@/components/ui/icons/dashboard';
import {
  LoadingSpinner,
  ErrorMessage,
  useConfirmationDialog
} from '@/components/ui';
import Button from '@/components/ui/button/button';

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

const devices = [
  { value: '', label: 'All Devices' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' }
];

interface EditCampaignClientProps {
  campaignId: string;
}

export default function EditCampaignClient({
  campaignId
}: EditCampaignClientProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    country_target: '',
    device_target: '',
    credits_allocated: 0
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        const data = await response.json();
        setCampaign(data.campaign);
        setFormData({
          title: data.campaign.title || '',
          url: data.campaign.url || '',
          description: data.campaign.description || '',
          country_target: data.campaign.country_target || '',
          device_target: data.campaign.device_target || '',
          credits_allocated: data.campaign.credits_allocated || 0
        });
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits_allocated' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert empty device_target to null
      const submitData = {
        ...formData,
        device_target:
          formData.device_target === '' ? null : formData.device_target,
        country_target:
          formData.country_target === '' ? null : formData.country_target,
        description: formData.description === '' ? null : formData.description
      };

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      const result = await response.json();
      setCampaign(result.campaign);
      setSuccess('Campaign updated successfully!');

      // Redirect to campaign details after a short delay
      setTimeout(() => {
        router.push(`/dashboard/campaigns/${campaignId}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    confirm({
      title: 'Delete Campaign',
      description:
        'Are you sure you want to delete this campaign? This action cannot be undone.',
      confirmText: 'Yes, Delete Campaign',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete campaign');
          }

          router.push('/dashboard/campaigns');
        } catch (err) {
          console.error('Error deleting campaign:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !campaign) {
    return <ErrorMessage title="Error loading campaign" message={error} />;
  }

  if (!campaign) {
    return (
      <ErrorMessage
        title="Campaign not found"
        message="The requested campaign could not be found."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-awten-dark-600 hover:text-awten-dark-900 hover:bg-awten-dark-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-awten-100 rounded-lg">
            <CampaignsIcon className="w-6 h-6 text-awten-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-awten-dark-900">
              Edit Campaign
            </h1>
            <p className="text-awten-dark-600">
              Update your campaign settings and configuration
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-awten-dark-900">
              {campaign.title}
            </h2>
            <p className="text-sm text-awten-dark-500">
              Created {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-awten-dark-500">Status</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                campaign.status === 'active'
                  ? 'bg-success-100 text-success-800'
                  : campaign.status === 'paused'
                    ? 'bg-warning-100 text-warning-800'
                    : campaign.status === 'completed'
                      ? 'bg-info-100 text-info-800'
                      : 'bg-error-100 text-error-800'
              }`}
            >
              {campaign.status.charAt(0).toUpperCase() +
                campaign.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-awten-dark-500">Credits Allocated</p>
            <p className="font-semibold text-awten-dark-900">
              {campaign.credits_allocated}
            </p>
          </div>
          <div>
            <p className="text-awten-dark-500">Credits Spent</p>
            <p className="font-semibold text-awten-dark-900">
              {campaign.credits_spent}
            </p>
          </div>
          <div>
            <p className="text-awten-dark-500">Remaining</p>
            <p className="font-semibold text-awten-dark-900">
              {campaign.credits_allocated - campaign.credits_spent}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="px-6 py-4 border-b border-awten-dark-200">
          <h2 className="text-lg font-semibold text-awten-dark-900">
            Campaign Details
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
            {/* Campaign Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Campaign Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
                required
              />
            </div>

            {/* Website URL */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Website URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-awten-dark-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
              placeholder="Brief description of your campaign"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Country Target */}
            <div>
              <label
                htmlFor="country_target"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Country Target
              </label>
              <select
                id="country_target"
                name="country_target"
                value={formData.country_target}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Device Target */}
            <div>
              <label
                htmlFor="device_target"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Device Target
              </label>
              <select
                id="device_target"
                name="device_target"
                value={formData.device_target}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
              >
                {devices.map((device) => (
                  <option key={device.value} value={device.value}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Credits Allocated */}
            <div>
              <label
                htmlFor="credits_allocated"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Credits to Allocate
              </label>
              <input
                type="number"
                id="credits_allocated"
                name="credits_allocated"
                value={formData.credits_allocated}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-awten-dark-200">
            <Button
              type="button"
              color="alert"
              variant="solid"
              size="small"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete Campaign
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                color="gray"
                variant="outline"
                size="small"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="solid"
                size="small"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {ConfirmationDialog}
    </div>
  );
}
