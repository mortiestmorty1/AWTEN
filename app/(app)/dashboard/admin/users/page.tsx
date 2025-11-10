'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import {
  UsersIcon,
  ShieldIcon,
  CreditCardIcon
} from '@/components/ui/icons/dashboard';
import { UserManagementDialog } from '@/components/ui/user-management-dialog';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'free' | 'premium' | 'admin';
  credits: number;
  total_visits: number;
  created_at: string;
  last_active: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'admin'>(
    'all'
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'premium':
        return 'success';
      case 'free':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
      />

      {/* Filter Tabs */}
      <FilterTabs
        options={[
          { key: 'all', label: 'All Users' },
          { key: 'free', label: 'Free Users' },
          { key: 'premium', label: 'Premium Users' },
          { key: 'admin', label: 'Admins' }
        ]}
        activeFilter={filter}
        onFilterChange={(tab) => setFilter(tab as any)}
      />

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="No users match the current filter criteria."
        />
      ) : (
        <div className="bg-white rounded-lg border border-awten-dark-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-awten-dark-200">
              <thead className="bg-awten-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-awten-dark-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-awten-dark-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-awten-dark-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-awten-primary-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-awten-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-awten-dark-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-awten-dark-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-awten-dark-900">
                      {user.credits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-awten-dark-900">
                      {user.total_visits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-awten-dark-500">
                      {new Date(user.last_active).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <UserManagementDialog
                          user={user}
                          onUserUpdate={(userId, updates) => {
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === userId
                                  ? {
                                      ...u,
                                      username: updates.username || u.username
                                    }
                                  : u
                              )
                            );
                          }}
                        >
                          <button className="text-awten-primary-600 hover:text-awten-primary-900">
                            Edit
                          </button>
                        </UserManagementDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
