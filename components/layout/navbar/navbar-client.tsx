'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { NavLinks } from './nav-links';

export default function NavbarClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <nav className="bg-white border-b border-awten-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-awten-100 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-20 bg-awten-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <NavLinks user={user} />
    </>
  );
}
