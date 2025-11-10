'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { CreditsIcon, PlusIcon } from '@/components/ui/icons/dashboard';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'earned' | 'spent' | 'refund';
  description: string;
  created_at: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  price_id: string;
}

const TransactionTypeIcon = ({ type }: { type: string }) => {
  const iconClasses = {
    purchase: 'text-info-600 bg-info-100',
    earned: 'text-success-600 bg-success-100',
    spent: 'text-warning-600 bg-warning-100',
    refund: 'text-error-600 bg-error-100'
  };

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClasses[type as keyof typeof iconClasses]}`}
    >
      {type === 'purchase' && <span className="text-sm font-bold">$</span>}
      {type === 'earned' && <span className="text-sm font-bold">+</span>}
      {type === 'spent' && <span className="text-sm font-bold">-</span>}
      {type === 'refund' && <span className="text-sm font-bold">↩</span>}
    </div>
  );
};

const CreditPackageCard = ({
  pkg,
  onPurchase,
  loading
}: {
  pkg: CreditPackage;
  onPurchase: (packageId: string) => void;
  loading: boolean;
}) => {
  const savings =
    pkg.credits > 100
      ? Math.round(((pkg.credits / 10 - pkg.price) / (pkg.credits / 10)) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
          {pkg.name}
        </h3>
        <div className="mb-4">
          <div className="text-3xl font-bold text-awten-dark-900">
            {pkg.credits.toLocaleString()}
          </div>
          <div className="text-sm text-awten-dark-500">Credits</div>
        </div>
        <div className="mb-4">
          <div className="text-2xl font-bold text-awten-600">${pkg.price}</div>
          {savings > 0 && (
            <div className="text-sm text-success-600 font-medium">
              Save {savings}% vs individual
            </div>
          )}
        </div>
        <button
          onClick={() => onPurchase(pkg.id)}
          disabled={loading}
          className="w-full px-4 py-2 bg-awten-600 text-white rounded-lg hover:bg-awten-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Processing...' : 'Purchase'}
        </button>
      </div>
    </div>
  );
};

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCreditsData = async () => {
      try {
        setLoading(true);

        // Fetch profile (balance)
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setBalance(profileData.profile.credits || 0);
        }

        // Fetch credit packages
        const packagesResponse = await fetch('/api/credits/purchase');
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          setPackages(packagesData.packages || []);
        }

        // Fetch transactions
        const transactionsResponse = await fetch('/api/credits/transactions');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData.transactions || []);
        }
      } catch (err) {
        console.error('Error fetching credits data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditsData();
  }, []);

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(packageId);
      setError(null);

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ package_id: packageId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const result = await response.json();

      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        setError('Checkout session created but no URL provided');
      }
    } catch (err) {
      console.error('Error purchasing credits:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-awten-dark-900">Credits</h1>
          <p className="text-awten-dark-600 mt-1">
            Manage your credit balance and purchase history
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-awten-600 to-awten-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-awten-100">
              Available Credits
            </h2>
            <p className="text-3xl font-bold mt-1">
              {balance.toLocaleString()}
            </p>
            <p className="text-awten-100 mt-1">Ready to use for campaigns</p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-lg">
            <CreditsIcon className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Purchase Packages */}
      <div>
        <h2 className="text-lg font-semibold text-awten-dark-900 mb-4">
          Purchase Credits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <CreditPackageCard
              key={pkg.id}
              pkg={pkg}
              onPurchase={handlePurchase}
              loading={purchasing === pkg.id}
            />
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-awten-dark-200">
        <div className="px-6 py-4 border-b border-awten-dark-200">
          <h2 className="text-lg font-semibold text-awten-dark-900">
            Transaction History
          </h2>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditsIcon className="w-12 h-12 text-awten-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-awten-dark-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-awten-dark-500">
                Your credit purchase and usage history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-awten-dark-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <TransactionTypeIcon type={transaction.type} />
                    <div>
                      <p className="font-medium text-awten-dark-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-awten-dark-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'purchase' ||
                        transaction.type === 'earned' ||
                        transaction.type === 'refund'
                          ? 'text-success-600'
                          : 'text-warning-600'
                      }`}
                    >
                      {transaction.type === 'purchase' ||
                      transaction.type === 'earned' ||
                      transaction.type === 'refund'
                        ? '+'
                        : '-'}
                      {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-awten-dark-500 capitalize">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
