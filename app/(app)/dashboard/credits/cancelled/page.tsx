'use client';

import { useRouter } from 'next/navigation';
import { XCircleIcon } from '@/components/ui/icons/dashboard';

export default function CreditsCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircleIcon className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard/credits')}
            className="w-full bg-awten-600 text-white px-4 py-2 rounded-lg hover:bg-awten-700 transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/dashboard/account')}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Go to Account
          </button>
        </div>
      </div>
    </div>
  );
}
