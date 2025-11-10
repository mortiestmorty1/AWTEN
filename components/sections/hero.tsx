'use client';

import { Button } from '@/components/ui';
import { PiRocketLaunch } from 'react-icons/pi';
import {
  ChartIcon,
  TargetIcon,
  CreditCardIcon
} from '@/components/ui/icons/dashboard';
import Link from 'next/link';
import { createClient } from '@/lib/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [supabase]);

  return (
    <section className="w-full py-8 sm:py-24">
      <div className="flex flex-col-reverse items-center justify-between w-full gap-16 sm:flex-row lg:pt-16">
        <div className="flex flex-col flex-1 gap-9">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-awten-dark-900 sm:text-6xl">
              Boost Your Website Traffic with AWTEN
            </h1>
            <p className="text-lg font-medium text-canvas-text">
              Join the Advanced Website Traffic Exchange Network and grow your
              website's visibility through our credit-based traffic exchange
              system. Earn credits by visiting other websites and spend them to
              get quality traffic to your own site.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {loading ? (
              // Show loading state while fetching user profile
              <>
                <Button
                  color="primary"
                  variant="solid"
                  size="large"
                  className="w-full sm:w-fit"
                  disabled
                >
                  <PiRocketLaunch />
                  Loading...
                </Button>
                <Button
                  color="gray"
                  variant="outline"
                  size="large"
                  className="w-full sm:w-fit"
                  disabled
                >
                  Loading...
                </Button>
              </>
            ) : userProfile ? (
              <>
                <Link href={userProfile?.role === 'admin' ? '/dashboard/admin' : '/dashboard'}>
                  <Button
                    color="primary"
                    variant="solid"
                    size="large"
                    className="w-full sm:w-fit"
                  >
                    <PiRocketLaunch />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href={userProfile?.role === 'admin' ? '/dashboard/admin/users' : '/dashboard/account'}>
                  <Button
                    color="gray"
                    variant="outline"
                    size="large"
                    className="w-full sm:w-fit"
                  >
                    {userProfile?.role === 'admin' ? 'User Management' : 'Account Settings'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    color="primary"
                    variant="solid"
                    size="large"
                    className="w-full sm:w-fit"
                  >
                    <PiRocketLaunch />
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button
                    color="gray"
                    variant="outline"
                    size="large"
                    className="w-full sm:w-fit"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="relative flex items-center justify-center flex-1 w-full py-16">
          <div className="absolute z-0 sm:max-xl:h-[450px]">
            <img
              src="/assets/images/hero/blob.png"
              alt="Blob background"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative z-10 flex justify-center w-full overflow-hidden rounded-lg">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-awten-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-2">
                  AWTEN Dashboard
                </h3>
                <p className="text-awten-dark-600 mb-4">
                  Manage your campaigns, track visits, and monitor your traffic
                  growth all in one place.
                </p>
                <div className="flex justify-center space-x-6 text-sm text-awten-dark-500">
                  <div className="flex items-center space-x-1">
                    <ChartIcon className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TargetIcon className="w-4 h-4" />
                    <span>Campaigns</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CreditCardIcon className="w-4 h-4" />
                    <span>Credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
