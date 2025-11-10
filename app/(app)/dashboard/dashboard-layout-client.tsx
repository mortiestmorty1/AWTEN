'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DashboardIcon,
  CampaignsIcon,
  AnalyticsIcon,
  CreditsIcon,
  VisitsIcon,
  SettingsIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  UsersIcon,
  ShieldIcon
} from '@/components/ui/icons/dashboard';
import { CampaignCreateDialog } from '@/components/ui/campaign-create-dialog';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: CampaignsIcon },
  { name: 'Earn Credits', href: '/dashboard/earn', icon: VisitsIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: AnalyticsIcon },
  { name: 'Credits', href: '/dashboard/credits', icon: CreditsIcon },
  { name: 'Account', href: '/dashboard/account', icon: SettingsIcon }
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/dashboard/admin', icon: DashboardIcon },
  { name: 'User Management', href: '/dashboard/admin/users', icon: UsersIcon },
  {
    name: 'All Campaigns',
    href: '/dashboard/admin/campaigns',
    icon: CampaignsIcon
  },
  {
    name: 'System Monitoring',
    href: '/dashboard/admin/monitoring',
    icon: AnalyticsIcon
  },
  { name: 'Fraud Detection', href: '/dashboard/admin/fraud', icon: ShieldIcon },
  { name: 'Account', href: '/dashboard/account', icon: SettingsIcon }
];

export default function DashboardLayoutClient({
  children
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('free');
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      setIsLoadingRole(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.profile?.role || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    } finally {
      setIsLoadingRole(false);
    }
  };

  const getNavigation = () => {
    switch (userRole) {
      case 'admin':
        return adminNavigation;
      default:
        return baseNavigation;
    }
  };

  const navigation = getNavigation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Show loading state while determining user role
  if (isLoadingRole) {
    return (
      <div className="h-screen bg-awten-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-awten-600 mx-auto mb-4"></div>
          <p className="text-awten-dark-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-awten-dark-50 flex flex-col">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-awten-dark-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-awten-dark-400 hover:text-awten-dark-600 hover:bg-awten-dark-100"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="ml-2 text-xl font-semibold text-awten-dark-900">
              {navigation.find((item) => item.href === pathname)?.name ||
                'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-awten-dark-400 hover:text-awten-dark-600 hover:bg-awten-dark-100 rounded-lg transition-colors duration-200">
              <BellIcon className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 text-sm font-medium text-awten-dark-700 hover:bg-awten-dark-100 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-awten-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block">Account</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-awten-dark-200 py-1 z-50">
                  <Link
                    href="/dashboard/account"
                    className="flex items-center px-4 py-2 text-sm text-awten-dark-700 hover:bg-awten-dark-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <SettingsIcon className="w-4 h-4 mr-3" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-awten-dark-700 hover:bg-awten-dark-50"
                  >
                    <LogoutIcon className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-awten-dark-200 flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-awten-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-awten-dark-900">
                  AWTEN
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-awten-dark-400 hover:text-awten-dark-600 hover:bg-awten-dark-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        ${
                          isActive
                            ? 'bg-awten-50 text-awten-700 border-r-2 border-awten-600'
                            : 'text-awten-dark-600 hover:bg-awten-50 hover:text-awten-700'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                        mr-3 flex-shrink-0 w-5 h-5
                        ${isActive ? 'text-awten-600' : 'text-awten-dark-400 group-hover:text-awten-600'}
                      `}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions - Only show for non-admin users */}
              {userRole !== 'admin' && (
                <div className="mt-8">
                  <CampaignCreateDialog
                    onCampaignCreate={() => window.location.reload()}
                  >
                    <button className="group flex items-center w-full px-3 py-2 text-sm font-medium text-awten-dark-600 hover:bg-awten-50 hover:text-awten-700 rounded-lg transition-colors duration-200">
                      <PlusIcon className="mr-3 flex-shrink-0 w-5 h-5 text-awten-dark-400 group-hover:text-awten-600" />
                      New Campaign
                    </button>
                  </CampaignCreateDialog>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 w-full overflow-y-auto bg-awten-dark-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
