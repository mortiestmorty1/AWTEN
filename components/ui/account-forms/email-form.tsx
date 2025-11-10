'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEmail } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Input } from '@/components/ui';
import { MailIcon } from '@/components/ui/icons/dashboard';

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userEmail ?? '');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userEmail);
  }, [inputValue, userEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const newEmailInput = e.currentTarget.elements.namedItem(
      'newEmail'
    ) as HTMLInputElement;

    if (newEmailInput.value === userEmail) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    await handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-awten-100 rounded-lg flex items-center justify-center">
            <MailIcon className="w-6 h-6 text-awten-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-awten-dark-900">
              Email Address
            </h3>
            <p className="text-awten-dark-600">
              Update your email address for account notifications
            </p>
          </div>
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Input
              type="email"
              name="newEmail"
              placeholder="Your email"
              maxLength={64}
              className="w-64"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              color="primary"
              size="small"
              variant="solid"
              loading={isSubmitting}
              disabled={isButtonDisabled}
              className="flex items-center space-x-2"
            >
              <MailIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update Email'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
