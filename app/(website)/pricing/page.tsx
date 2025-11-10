'use client';

import PageLayoutClient from '@/components/layout/page-layout-client';
import { CheckMarkIcon } from '@/components/ui/icons/website';
import { createClient } from '@/lib/utils/supabase/client';
import { useToast } from '@/components/ui/toasts/use-toast';

export default function PricingPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const gateToSignin = async (target: string) => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/signin?redirect=${encodeURIComponent(target)}`;
        return;
      }
      // Block admins from purchasing
      const { profile } = await fetch('/api/profile').then((r) => r.ok ? r.json() : { profile: null });
      if (profile?.role === 'admin') {
        toast({
          title: 'Action not allowed',
          description: 'Admins cannot purchase credits or memberships.',
          variant: 'destructive'
        });
        return;
      }
      window.location.href = target;
    } catch {
      window.location.href = `/signin?redirect=${encodeURIComponent(target)}`;
    }
  };

  return (
    <PageLayoutClient>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-awten-dark-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-awten-dark-600 max-w-3xl mx-auto">
            Choose the plan that fits your traffic needs. All plans include our
            advanced fraud detection and quality traffic guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-awten-dark-200 p-8 relative">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-awten-dark-900 mb-2">
                Free
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-awten-dark-900">
                  $0
                </span>
                <span className="text-awten-dark-600">/month</span>
              </div>
              <p className="text-awten-dark-600 mb-8">
                Perfect for getting started
              </p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  10 free credits to start
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  Up to 3 active campaigns
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  Basic targeting options
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  Fraud protection included
                </span>
              </li>
            </ul>
            <button className="w-full bg-awten-dark-100 text-awten-dark-900 py-3 px-6 rounded-lg font-medium hover:bg-awten-dark-200 transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Premium Monthly Plan */}
          <div className="bg-white rounded-2xl border-2 border-awten-primary-500 p-6 lg:p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-awten-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-awten-dark-900 mb-2">
                Premium Monthly
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-awten-dark-900">
                  $19.99
                </span>
                <span className="text-awten-dark-600">/month</span>
              </div>
              <p className="text-awten-dark-600 mb-8">
                Perfect for regular users
              </p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  500 credits included
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  1.2x credit multiplier
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Unlimited campaigns</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Advanced targeting</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => gateToSignin('/dashboard/subscription')}
              className="w-full bg-awten-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-awten-primary-700 transition-colors"
            >
              Start Premium Monthly
            </button>
          </div>

          {/* Premium Yearly Plan */}
          <div className="bg-white rounded-2xl border border-awten-dark-200 p-6 lg:p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Best Value
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-awten-dark-900 mb-2">
                Premium Yearly
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-awten-dark-900">
                  $199.99
                </span>
                <span className="text-awten-dark-600">/year</span>
                <div className="text-sm text-green-600 mt-2">
                  Save 17% ($16.67/month)
                </div>
              </div>
              <p className="text-awten-dark-600 mb-8">Best for power users</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  6,000 credits included
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">
                  1.2x credit multiplier
                </span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Unlimited campaigns</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Advanced targeting</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => gateToSignin('/dashboard/subscription')}
              className="w-full bg-awten-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-awten-primary-700 transition-colors"
            >
              Start Premium Yearly
            </button>
          </div>

          {/* Enterprise Plan - Commented out for now */}
          {/* 
          <div className="bg-white rounded-2xl border border-awten-dark-200 p-8 relative">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-awten-dark-900 mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-awten-dark-900">Custom</span>
              </div>
              <p className="text-awten-dark-600 mb-8">For large organizations</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Unlimited credits</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Custom integrations</span>
              </li>
              <li className="flex items-center">
                <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                <span className="text-awten-dark-700">Dedicated support</span>
              </li>
            </ul>
            <button className="w-full bg-awten-dark-100 text-awten-dark-900 py-3 px-6 rounded-lg font-medium hover:bg-awten-dark-200 transition-colors">
              Contact Sales
            </button>
          </div>
          */}
        </div>

        {/* Credit Packages */}
        <div className="bg-awten-dark-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-awten-dark-900 mb-4">
              Credit Packages
            </h2>
            <p className="text-awten-dark-600">
              Need more credits? Purchase additional credits anytime with our
              flexible packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                Starter
              </h3>
              <div className="text-3xl font-bold text-awten-dark-900 mb-2">
                100 Credits
              </div>
              <div className="text-2xl font-bold text-awten-primary-600 mb-4">
                $9.99
              </div>
              <div className="text-sm text-awten-dark-500">
                $0.0999 per credit
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center border-2 border-awten-primary-500">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                Popular
              </h3>
              <div className="text-3xl font-bold text-awten-dark-900 mb-2">
                500 Credits
              </div>
              <div className="text-2xl font-bold text-awten-primary-600 mb-4">
                $39.99
              </div>
              <div className="text-sm text-awten-dark-500">
                $0.0799 per credit
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                Professional
              </h3>
              <div className="text-3xl font-bold text-awten-dark-900 mb-2">
                1,000 Credits
              </div>
              <div className="text-2xl font-bold text-awten-primary-600 mb-4">
                $69.99
              </div>
              <div className="text-sm text-awten-dark-500">
                $0.0699 per credit
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                Enterprise
              </h3>
              <div className="text-3xl font-bold text-awten-dark-900 mb-2">
                2,500 Credits
              </div>
              <div className="text-2xl font-bold text-awten-primary-600 mb-4">
                $149.99
              </div>
              <div className="text-sm text-awten-dark-500">
                $0.0599 per credit
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayoutClient>
  );
}
