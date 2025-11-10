'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { UserIcon } from '@/components/ui/icons/dashboard';

export default function NameFormClient({
  userName,
  onUpdate
}: {
  userName: string;
  onUpdate?: (newName: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userName);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userName);
  }, [inputValue, userName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue === userName) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: inputValue
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      setMessage({ type: 'success', text: 'Name updated successfully!' });
      onUpdate?.(inputValue);
    } catch (error: any) {
      console.error('Error updating name:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update name'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-awten-100 rounded-lg flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-awten-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-awten-dark-900">
            Full Name
          </h3>
          <p className="text-sm text-awten-dark-600">
            Update your display name
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isButtonDisabled || isSubmitting}
            color="primary"
            size="medium"
            variant="solid"
          >
            {isSubmitting ? 'Updating...' : 'Update Name'}
          </Button>
        </div>
      </form>
    </div>
  );
}
