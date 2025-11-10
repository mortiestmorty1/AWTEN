'use client';

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui';
import { PiCheck } from 'react-icons/pi';
import { createClient } from '@/lib/utils/supabase/client';
import { useToast } from '@/components/ui/toasts/use-toast';

interface Props {
  // No props needed for credit purchase
}

export default function OurPlan({}: Props) {
  const [enabled, setEnabled] = useState(false); // Keep for future subscription feature
  const supabase = createClient();
  const { toast } = useToast();

  const handlePrimaryCta = async () => {
    const target = enabled ? '/dashboard/subscription' : '/dashboard/credits';
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/signin?redirect=${encodeURIComponent(target)}`;
        return;
      }
      // Check role; block admins
      const { data: profileRes } = await fetch('/api/profile').then((r) => r.ok ? r.json() : { profile: null });
      const role = profileRes?.profile?.role;
      if (role === 'admin') {
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
    <>
      {/* Our Plan Section */}
      <section
        id="pricing"
        aria-label="Purchase credits to run your traffic campaigns"
        className="z-0 flex flex-col items-center self-stretch px-5 py-8 mx-auto sm:px-0 sm:py-24"
      >
        <>
          <div className="flex flex-col justify-center w-full space-y-10 sm:max-w-screen-md">
            <div className="justify-center space-y-3 text-center">
              <h1 className="font-sans text-3xl font-bold text-canvas-text-contrast sm:text-5xl ">
                Choose Your <span className="text-awten-600">Plan</span>
              </h1>
              <p className="font-sans text-lg font-semibold text-canvas-text">
                Get credits and premium features for your traffic campaigns
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setEnabled(false)}
                  className={`mr-2 text-sm font-medium ${!enabled ? 'text-canvas-text-contrast' : 'text-canvas-solid'}`}
                >
                  Buy Credits
                </button>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={`group relative flex h-7 w-14 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white ${
                    enabled ? 'bg-awten-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </Switch>
                <button
                  onClick={() => setEnabled(true)}
                  className={`ml-2 text-sm font-medium ${enabled ? 'text-canvas-text-contrast    ' : 'text-canvas-solid'}`}
                >
                  Premium Subscription
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-[32px] rounded-3xl bg-awten-600 px-[10px] py-[10px] shadow-xl sm:flex-row sm:space-x-10 sm:space-y-0">
              <div id="product">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="h-full space-y-[40px] rounded-2xl bg-awten-700 px-10 py-10 sm:w-96 sm:px-[30px] sm:py-[30px]">
                    <div className="justify-center space-y-[20px] text-center">
                      <p className="font-sans text-lg font-semibold text-white">
                        {enabled ? 'Premium Subscription' : 'Credit Package'}
                      </p>
                      <div className="ali flex flex-row items-baseline justify-center space-x-[6px] text-center">
                        <h3 className="font-sans text-5xl font-bold text-white">
                          {enabled ? '$19.99' : '$9.99'}
                        </h3>
                        <p className="font-sans text-base font-semibold text-white">
                          {enabled ? '/month' : 'USD'}
                        </p>
                      </div>
                      <p className="font-sans text-sm text-white">
                        {enabled ? 'Unlimited + 1.2x Credits' : '100 Credits'}
                      </p>
                    </div>

                    <div className="mx-auto space-y-[20px] text-center">
                      <div className="flex justify-center">
                        <Button
                          className="h-[40px] w-[235px] space-x-[8px] !bg-white px-4 !text-awten-600"
                          color="primary"
                          variant="solid"
                          size="medium"
                          onClick={handlePrimaryCta}
                        >
                          <p className="font-sans text-sm font-semibold text-center">
                            {enabled ? 'Subscribe Now' : 'Buy Credits'}
                          </p>
                        </Button>
                      </div>
                      <p className="font-sans text-sm font-medium text-white">
                        {enabled
                          ? 'Monthly subscription with unlimited campaigns and 1.2x credit multiplier'
                          : 'Credits never expire and can be used for any campaign'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-[32px]  px-[10px] py-[10px] sm:px-5 sm:py-5">
                <h2 className="text-xl font-semibold text-canvas-bg">
                  {enabled ? 'Premium Features' : 'Features'}
                </h2>
                <div className="flex flex-col space-y-[16px] sm:space-x-[80px] sm:space-y-0">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <PiCheck />
                      <p className="text-base font-normal text-white">
                        {enabled
                          ? 'Unlimited traffic campaigns'
                          : 'Create up to 3 campaigns'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <PiCheck />
                      <p className="text-base font-normal text-white">
                        {enabled
                          ? '1.2x credit multiplier when earning'
                          : 'Advanced fraud detection system'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <PiCheck />
                      <p className="text-base font-normal text-white">
                        {enabled
                          ? 'Advanced targeting options'
                          : 'Real-time analytics and reporting'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <PiCheck width="24" height="24" />
                      <p className="text-base font-normal text-white">
                        {enabled
                          ? 'Priority customer support'
                          : 'Target specific countries and devices'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <PiCheck />
                      <p className="text-base font-normal text-white">
                        {enabled
                          ? 'Monthly credit bonus'
                          : '24/7 Customer Support'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </section>
    </>
  );
}
