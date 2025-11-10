'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/button';
import { CreditCardIcon } from '@/components/ui/icons/dashboard';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number | string;
  popular?: boolean;
}

interface CreditPurchaseDialogProps {
  children: React.ReactNode;
  onPurchase?: (packageId: string) => void;
}

export const CreditPurchaseDialog: React.FC<CreditPurchaseDialogProps> = ({
  children,
  onPurchase
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchPackages();
    }
  }, [open]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/credits/purchase');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ package_id: selectedPackage })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error('No checkout URL returned from server');
          alert('Failed to create checkout session. Please try again.');
        }
        onPurchase?.(selectedPackage);
        setOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create checkout session:', errorData.error || 'Unknown error');
        alert(errorData.error || 'Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('An error occurred while processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultPackages: CreditPackage[] = [
    {
      id: 'credit_100',
      name: 'Starter',
      credits: 100,
      price: 9.99,
      pricePerCredit: 0.0999
    },
    {
      id: 'credit_500',
      name: 'Popular',
      credits: 500,
      price: 39.99,
      pricePerCredit: 0.0799,
      popular: true
    },
    {
      id: 'credit_1000',
      name: 'Professional',
      credits: 1000,
      price: 69.99,
      pricePerCredit: 0.0699
    },
    {
      id: 'credit_2500',
      name: 'Enterprise',
      credits: 2500,
      price: 149.99,
      pricePerCredit: 0.0599
    }
  ];

  const packagesToShow = packages.length > 0 ? packages : defaultPackages;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to fuel your traffic campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {packagesToShow.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? 'border-awten-600 bg-awten-50'
                  : 'border-awten-dark-200 hover:border-awten-400'
              } ${pkg.popular ? 'ring-2 ring-awten-600' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-awten-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="font-semibold text-awten-dark-900">
                  {pkg.name}
                </h3>
                <div className="text-2xl font-bold text-awten-dark-900 mt-2">
                  {pkg.credits.toLocaleString()} Credits
                </div>
                <div className="text-lg font-semibold text-awten-primary-600 mt-1">
                  ${pkg.price}
                </div>
                <div className="text-sm text-awten-dark-500 mt-1">
                  ${typeof pkg.pricePerCredit === 'number' 
                    ? pkg.pricePerCredit.toFixed(4) 
                    : pkg.pricePerCredit || (pkg.price / pkg.credits).toFixed(4)} per credit
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            color="gray"
            variant="outline"
            size="small"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="small"
            onClick={handlePurchase}
            disabled={!selectedPackage || loading}
          >
            {loading ? 'Processing...' : 'Purchase Credits'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
