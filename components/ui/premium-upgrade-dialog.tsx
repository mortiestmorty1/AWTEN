'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarIcon, CheckIcon } from '@/components/ui/icons/dashboard';
import { useToast } from '@/components/ui/toasts/use-toast';

interface PremiumPlan {
  id: string;
  name: string;
  priceDisplay: string;
  monthlyPrice: string;
  savings: number;
  credits: number;
  description: string;
  isPopular: boolean;
  isBestValue: boolean;
}

interface PremiumUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: (planId: string) => void;
}

export default function PremiumUpgradeDialog({
  isOpen,
  onClose,
  onUpgrade
}: PremiumUpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium_monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (planId: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan_id: planId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;

      // Call the callback if provided
      onUpgrade?.(planId);
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to start premium upgrade. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plans: PremiumPlan[] = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      priceDisplay: '$19.99',
      monthlyPrice: '$19.99',
      savings: 0,
      credits: 500,
      description: 'Premium features with 500 monthly credits',
      isPopular: true,
      isBestValue: false
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      priceDisplay: '$199.99',
      monthlyPrice: '$16.67',
      savings: 17,
      credits: 6000,
      description: 'Premium features with 6000 yearly credits',
      isPopular: false,
      isBestValue: true
    }
  ];

  const features = [
    '1.2x credit multiplier on all earnings',
    'Unlimited campaigns (vs 3 for free users)',
    'Advanced targeting options',
    'Priority support',
    'Monthly/yearly credit bonuses',
    'No ads in dashboard'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StarIcon className="w-6 h-6 text-awten-600" />
            <span>Upgrade to Premium</span>
          </DialogTitle>
          <DialogDescription>
            Unlock unlimited campaigns, 1.2x credit multiplier, and advanced
            features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-awten-dark-600">{feature}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'border-awten-600 bg-awten-50'
                    : 'border-awten-dark-200 hover:border-awten-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-awten-600 text-white text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.isBestValue && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-awten-600">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-awten-dark-600">
                      /{plan.id === 'premium_yearly' ? 'year' : 'month'}
                    </span>
                    {plan.savings > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Save {plan.savings}% (${plan.monthlyPrice}/month)
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-awten-dark-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="text-sm text-awten-dark-500">
                    <strong>{plan.credits.toLocaleString()}</strong> credits
                    included
                  </div>
                </div>

                <div className="mt-4">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mx-auto ${
                      selectedPlan === plan.id
                        ? 'border-awten-600 bg-awten-600'
                        : 'border-awten-dark-300'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              color="primary"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUpgrade(selectedPlan)}
              disabled={isLoading}
              className="bg-awten-600 hover:bg-awten-700"
              color="primary"
              size="medium"
              variant="solid"
            >
              {isLoading ? 'Processing...' : 'Upgrade Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
