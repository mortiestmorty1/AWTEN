'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@/components/ui/icons/dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

function CreditsSuccessContent() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [message, setMessage] = useState('');
  const [credits, setCredits] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('No session ID provided');
        return;
      }

      try {
        const response = await fetch('/api/credits/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setCredits(data.credits);

          // Redirect to account page after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/account');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to process payment');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment');
      }
    };

    processPayment();
  }, [sessionId, router]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner />
          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            Processing Payment...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we add credits to your account.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Processing Failed
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        {credits > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              +{credits} credits added to your account
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to your account page in a few seconds...
        </p>
        <button
          onClick={() => router.push('/dashboard/account')}
          className="w-full bg-awten-600 text-white px-4 py-2 rounded-lg hover:bg-awten-700 transition-colors duration-200"
        >
          Go to Account Now
        </button>
      </div>
    </div>
  );
}

export default function CreditsSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <LoadingSpinner />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <CreditsSuccessContent />
    </Suspense>
  );
}
