import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/lib/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect');

  if (code) {
    const supabase = createClient();

    const { error } = await (await supabase).auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }
  }

  // Determine redirect destination
  let redirectPath = '/account'; // Default redirect
  if (redirectTo) {
    try {
      // Validate that the redirect URL is safe (same origin)
      const redirectUrl = new URL(redirectTo, requestUrl.origin);
      if (redirectUrl.origin === requestUrl.origin) {
        redirectPath = redirectUrl.pathname + redirectUrl.search;
      }
    } catch {
      // If redirect URL is invalid, use default
      redirectPath = '/account';
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}${redirectPath}`,
      'Success!',
      'You are now signed in.'
    )
  );
}
