'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { LogoutIcon } from '@/components/ui/icons/dashboard';
import { createClient } from '@/lib/utils/supabase/client';

export default function SignOutFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-awten-100 rounded-lg flex items-center justify-center">
            <LogoutIcon className="w-6 h-6 text-awten-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-awten-dark-900">
              Sign Out
            </h3>
            <p className="text-awten-dark-600">
              Sign out of your account and return to the home page
            </p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          color="alert"
          size="small"
          variant="solid"
          disabled={isSubmitting}
          className="flex items-center space-x-2"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>{isSubmitting ? 'Signing out...' : 'Sign Out'}</span>
        </Button>
      </div>
    </div>
  );
}
