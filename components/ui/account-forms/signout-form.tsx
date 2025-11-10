'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { SignOut } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/lib/utils/auth-helpers/settings';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { LogoutIcon } from '@/components/ui/icons/dashboard';

export default function SignOutForm() {
  let router: AppRouterInstance | null = useRouter();
  router = getRedirectMethod() === 'client' ? router : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, SignOut, router);
    setIsSubmitting(false);
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
        <form onSubmit={(e) => handleSubmit(e)} className="flex-shrink-0">
          <input type="hidden" name="pathName" value={usePathname()} />
          <Button
            type="submit"
            color="alert"
            size="small"
            variant="solid"
            loading={isSubmitting}
            className="flex items-center space-x-2"
          >
            <LogoutIcon className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing out...' : 'Sign Out'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
