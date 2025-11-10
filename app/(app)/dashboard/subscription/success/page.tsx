'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { StarIcon, CheckIcon } from '@/components/ui/icons/dashboard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshProfile } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processSubscription = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Process the subscription upgrade immediately
        const response = await fetch('/api/subscription/process-upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process subscription');
        }

        const result = await response.json();
        console.log('Subscription processed:', result);

        // Refresh user profile to get updated role and credits
        await refreshProfile();
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing subscription:', err);
        setError('Failed to process subscription');
        setIsLoading(false);
      }
    };

    processSubscription();
  }, [sessionId, refreshProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600 mx-auto"></div>
          <p className="text-awten-dark-600 mt-4">
            Processing your subscription...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Subscription Error"
          description="There was an error processing your subscription"
          icon={StarIcon}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4"
            color="primary"
            size="medium"
            variant="solid"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome to Premium!"
        description="Your subscription has been successfully activated"
        icon={StarIcon}
      />

      <div className="bg-green-50 border border-green-200 rounded-lg p-8">
        <div className="flex items-center space-x-3 mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">
            Subscription Activated!
          </h2>
        </div>

        <div className="space-y-4 text-green-700">
          <p className="text-lg">
            You now have access to all premium features:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" />
              <span>1.2x credit multiplier on all earnings</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" />
              <span>Unlimited campaigns (vs 3 for free users)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" />
              <span>Advanced targeting options</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4" />
              <span>Monthly/yearly credit bonuses</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex space-x-4">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-awten-600 hover:bg-awten-700"
            color="primary"
            size="medium"
            variant="solid"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.push('/dashboard/campaigns')}
            variant="outline"
            color="primary"
            size="medium"
          >
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600 mx-auto mb-4"></div>
            <p className="text-awten-dark-600">
              Loading subscription details...
            </p>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
