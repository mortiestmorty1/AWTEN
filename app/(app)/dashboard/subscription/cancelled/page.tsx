'use client';

import { PageHeader } from '@/components/ui/page-header';
import { StarIcon } from '@/components/ui/icons/dashboard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SubscriptionCancelledPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Cancelled"
        description="Your subscription upgrade was cancelled"
        icon={StarIcon}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">No Problem!</h2>

        <div className="space-y-4 text-yellow-700">
          <p className="text-lg">
            Your subscription upgrade was cancelled. You can always upgrade
            later when you're ready.
          </p>
          <p>
            As a free user, you can still create up to 3 campaigns and earn
            credits by visiting other users' campaigns.
          </p>
        </div>

        <div className="mt-6 flex space-x-4">
          <Button
            onClick={() => router.push('/dashboard')}
            color="primary"
            size="medium"
            variant="solid"
            className="bg-awten-600 hover:bg-awten-700"
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={() => router.push('/dashboard/earn')}
            color="primary"
            size="medium"
            variant="outline"
          >
            Earn Credits
          </Button>
        </div>
      </div>
    </div>
  );
}
