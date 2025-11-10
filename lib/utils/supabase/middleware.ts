import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response } = createClient(request);

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    // Only check role for dashboard routes to improve performance
    const pathname = request.nextUrl.pathname;
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (user && isDashboardRoute) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // If there's an error fetching profile, continue without redirect
        if (error || !profile) {
          return response;
        }

        const url = request.nextUrl.clone();

        // Redirect admin users from regular dashboard routes to admin dashboard
        if (profile.role === 'admin') {
          // Regular dashboard routes that admin users shouldn't access
          const regularDashboardRoutes = [
            '/dashboard',
            '/dashboard/campaigns',
            '/dashboard/analytics',
            '/dashboard/credits',
            '/dashboard/earn',
            '/dashboard/visits',
            '/dashboard/subscription'
          ];

          // Routes that admin users should be able to access
          const allowedAdminRoutes = [
            '/dashboard/account',
            '/dashboard/campaigns/[id]' // This will be handled by pattern matching below
          ];

          // Check if the current path matches any regular dashboard route
          const isRegularDashboardRoute = regularDashboardRoutes.some(route => 
            pathname === route || pathname.startsWith(route + '/')
          );

          // Check if it's an allowed route (account or campaign details)
          const isAllowedRoute = pathname === '/dashboard/account' || 
            pathname.match(/^\/dashboard\/campaigns\/[a-f0-9-]+$/);

          // Prevent redirect loops by checking if we're already on an admin route
          const isAlreadyOnAdminRoute = pathname.startsWith('/dashboard/admin');

          if (isRegularDashboardRoute && !isAllowedRoute && !isAlreadyOnAdminRoute) {
            // Redirect to admin dashboard
            url.pathname = '/dashboard/admin';
            return NextResponse.redirect(url);
          }
        }
      } catch (profileError) {
        // If profile fetch fails, continue without redirect to prevent blocking
        console.error('Profile fetch error in middleware:', profileError);
        return response;
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
