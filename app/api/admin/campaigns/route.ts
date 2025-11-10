import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

// ============================================================================
// GET /api/admin/campaigns - Get all campaigns for admin users
// ============================================================================
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin and get campaigns in parallel
    const [{ data: profile }, { data: campaigns, error: campaignsError }] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
      supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500) // Limit for performance
    ]);

    if (!profile || (profile as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Get user information for all campaign owners
    const userIds = Array.from(new Set((campaigns as any[])?.map((campaign) => campaign.user_id) || []));
    
    // Only fetch profiles if we have campaigns
    const { data: profiles, error: profilesError } = userIds.length > 0
      ? await supabase
          .from('profiles')
          .select('id, username, role')
          .in('id', userIds)
      : { data: null, error: null };

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    // Create a map of user ID to profile data
    const profileMap =
      (profiles as any[])?.reduce(
        (acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        },
        {} as Record<string, any>
      ) || {};

    // Combine campaigns with profile data
    const campaignsWithProfiles =
      (campaigns as any[])?.map((campaign) => ({
        ...campaign,
        profiles: profileMap[campaign.user_id] || {
          username: 'Unknown',
          role: 'unknown'
        }
      })) || [];

    return NextResponse.json({
      campaigns: campaignsWithProfiles
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
