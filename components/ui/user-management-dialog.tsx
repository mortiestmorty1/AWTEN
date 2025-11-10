'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { UsersIcon } from '@/components/ui/icons/dashboard';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'free' | 'premium' | 'admin';
  credits: number;
}

interface UserManagementDialogProps {
  children: React.ReactNode;
  user?: User;
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
}

export const UserManagementDialog: React.FC<UserManagementDialogProps> = ({
  children,
  user,
  onUserUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id,
          username: formData.username
        })
      });

      if (response.ok) {
        onUserUpdate?.(user.id, { username: formData.username });
        setOpen(false);
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Manage User
          </DialogTitle>
          <DialogDescription>
            Update the user's username.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end items-center pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                color="gray"
                variant="outline"
                size="small"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="solid"
                size="small"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
