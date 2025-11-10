'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateName } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Input } from '@/components/ui';
import { UserIcon } from '@/components/ui/icons/dashboard';

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userName);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userName);
  }, [inputValue, userName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const fullNameInput = e.currentTarget.elements.namedItem(
      'fullName'
    ) as HTMLInputElement;

    if (fullNameInput.value === userName) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    await handleRequest(e, updateName, router);
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
            <UserIcon className="w-6 h-6 text-awten-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-awten-dark-900">
              Full Name
            </h3>
            <p className="text-awten-dark-600">
              Update your display name for your account
            </p>
          </div>
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              name="fullName"
              className="w-64"
              maxLength={64}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="John Doe"
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
              <UserIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update Name'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
