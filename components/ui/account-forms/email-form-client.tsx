'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { MailIcon } from '@/components/ui/icons/dashboard';

export default function EmailFormClient({
  userEmail,
  onUpdate
}: {
  userEmail: string | undefined;
  onUpdate?: (newEmail: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userEmail || '');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userEmail);
  }, [inputValue, userEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue === userEmail) {
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
          email: inputValue
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update email');
      }

      setMessage({
        type: 'success',
        text: 'Email update initiated! Please check your email for confirmation.'
      });
      onUpdate?.(inputValue);
    } catch (error: any) {
      console.error('Error updating email:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update email'
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
          <MailIcon className="w-5 h-5 text-awten-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-awten-dark-900">
            Email Address
          </h3>
          <p className="text-sm text-awten-dark-600">
            Update your email address
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
            type="email"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter your email address"
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
            {isSubmitting ? 'Updating...' : 'Update Email'}
          </Button>
        </div>
      </form>
    </div>
  );
}
