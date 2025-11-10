'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { PlusIcon, CampaignsIcon } from '@/components/ui/icons/dashboard';

interface CampaignFormData {
  title: string;
  url: string;
  description: string;
  country_target: string;
  device_target: string;
  credits_allocated: number;
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
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile' }
];

const creditPackages = [
  { value: 100, label: '100 Credits', price: '$10' },
  { value: 500, label: '500 Credits', price: '$45' },
  { value: 1000, label: '1,000 Credits', price: '$80' },
  { value: 2500, label: '2,500 Credits', price: '$180' },
  { value: 5000, label: '5,000 Credits', price: '$320' }
];

export default function NewCampaignPage() {
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    url: '',
    description: '',
    country_target: 'US',
    device_target: 'desktop',
    credits_allocated: 100
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user credits on component mount
  useState(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserCredits(data.profile.credits || 0);
        }
      } catch (err) {
        console.error('Error fetching user credits:', err);
      }
    };
    fetchUserCredits();
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
    setLoading(true);
    setError(null);

    try {
      // Validate URL
      new URL(formData.url);

      // Check if user has enough credits
      if (formData.credits_allocated > userCredits) {
        setError(
          `Insufficient credits. You have ${userCredits} credits but need ${formData.credits_allocated}.`
        );
        setLoading(false);
        return;
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign');
      }

      const result = await response.json();
      router.push(`/dashboard/campaigns/${result.campaign.id}`);
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.url.trim() &&
    formData.credits_allocated > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-awten-100 rounded-lg">
          <CampaignsIcon className="w-6 h-6 text-awten-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-awten-dark-900">
            Create New Campaign
          </h1>
          <p className="text-awten-dark-600">
            Set up a new traffic campaign to drive visitors to your website
          </p>
        </div>
      </div>

      {/* Credits Info */}
      <div className="bg-info-50 border border-info-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
            <span className="text-info-600 font-bold">$</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-info-800">
              Available Credits
            </p>
            <p className="text-lg font-bold text-info-900">
              {userCredits.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-awten-dark-200 p-6 space-y-6">
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
              placeholder="e.g., My Website Traffic Campaign"
              className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
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
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
              required
            />
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
              placeholder="Describe your website and what visitors can expect..."
              rows={3}
              className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
            />
          </div>

          {/* Targeting Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="country_target"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Target Country
              </label>
              <select
                id="country_target"
                name="country_target"
                value={formData.country_target}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="device_target"
                className="block text-sm font-medium text-awten-dark-700 mb-2"
              >
                Target Device
              </label>
              <select
                id="device_target"
                name="device_target"
                value={formData.device_target}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
              >
                {devices.map((device) => (
                  <option key={device.value} value={device.value}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Credits Allocation */}
          <div>
            <label
              htmlFor="credits_allocated"
              className="block text-sm font-medium text-awten-dark-700 mb-2"
            >
              Credits to Allocate *
            </label>
            <div className="space-y-3">
              <input
                type="number"
                id="credits_allocated"
                name="credits_allocated"
                value={formData.credits_allocated}
                onChange={handleInputChange}
                min="1"
                max={userCredits}
                className="w-full px-3 py-2 border border-awten-dark-300 rounded-lg focus:ring-2 focus:ring-awten-500 focus:border-awten-500"
                required
              />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {creditPackages.map((pkg) => (
                  <button
                    key={pkg.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        credits_allocated: pkg.value
                      }))
                    }
                    className={`p-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.credits_allocated === pkg.value
                        ? 'bg-awten-600 text-white border-awten-600'
                        : 'bg-white text-awten-dark-600 border-awten-dark-300 hover:bg-awten-dark-50'
                    }`}
                  >
                    <div className="font-medium">{pkg.label}</div>
                    <div className="text-xs opacity-75">{pkg.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <p className="text-error-800">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-awten-dark-600 hover:text-awten-dark-700 hover:bg-awten-dark-50 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="px-6 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
