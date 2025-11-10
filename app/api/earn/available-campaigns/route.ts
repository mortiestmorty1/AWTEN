import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

interface CampaignData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  user_id: string;
  status: string;
  credits_allocated: number;
  credits_spent: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all queries in parallel for maximum performance
    const [
      { data: userProfile },
      { data: campaigns, error },
      { data: allUserVisits }
    ] = await Promise.all([
      // Get user's profile to determine max visits based on role
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
      // Get available campaigns - exclude current user's campaigns and only show active campaigns with remaining credits
      supabase
        .from('campaigns')
        .select('id, title, url, description, user_id, status, credits_allocated, credits_spent')
        .eq('status', 'active')
        .neq('user_id', user.id)
        .gt('credits_allocated', 0)
        .limit(20),
      // Get all user visits in parallel (we'll filter by campaign IDs later)
      supabase
        .from('visits')
        .select('campaign_id')
        .eq('visitor_id', user.id)
    ]);

    if (error) {
      console.error('Error fetching available campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Determine max visits based on user role
    const maxVisits = (userProfile as any)?.role === 'premium' ? 10 : 3;

    // Filter campaigns with remaining credits
    const finalCampaigns = ((campaigns || []) as CampaignData[]).filter((campaign) => {
      const remainingCredits = campaign.credits_allocated - (campaign.credits_spent || 0);
      return remainingCredits > 0;
    });

    // If no campaigns found, return early
    if (finalCampaigns.length === 0) {
      return NextResponse.json({ campaigns: [] });
    }

    // Get user IDs and campaign IDs for parallel queries
    const userIds = Array.from(new Set(finalCampaigns.map((c) => c.user_id)));
    const campaignIds = finalCampaigns.map((c) => c.id);

    // Run remaining queries in parallel
    const [{ data: profiles }] = await Promise.all([
      // Get usernames for campaign owners
      supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)
    ]);

    // Create maps for efficient lookups
    const usernameMap = new Map();
    (profiles as any[])?.forEach((profile: any) => {
      usernameMap.set(profile.id, profile.username);
    });

    // Filter visits by campaign IDs
    const userVisits = (allUserVisits || []).filter((visit: any) =>
      campaignIds.includes(visit.campaign_id)
    );

    // Create a map of campaign_id to visit count
    const visitCountMap = new Map();
    (userVisits as any[])?.forEach((visit: any) => {
      const count = visitCountMap.get(visit.campaign_id) || 0;
      visitCountMap.set(visit.campaign_id, count + 1);
    });

    // Transform the data to match expected format
    const transformedCampaigns = finalCampaigns.map((campaign) => {
      const visitCount = visitCountMap.get(campaign.id) || 0;
      const canVisit = visitCount < maxVisits;

      return {
        campaign_id: campaign.id,
        title: campaign.title,
        url: campaign.url,
        description: campaign.description,
        credits_per_visit: 1,
        owner_username:
          usernameMap.get(campaign.user_id) || 'Anonymous User',
        remaining_credits:
          campaign.credits_allocated - (campaign.credits_spent || 0),
        visit_count: visitCount,
        max_visits: maxVisits,
        can_visit: canVisit,
        visit_status: canVisit
          ? visitCount === 0
            ? 'new'
            : `${visitCount}/${maxVisits} visits`
          : 'max_visits_reached'
      };
    });

    return NextResponse.json({
      campaigns: transformedCampaigns
    });
  } catch (error) {
    console.error('Error in available-campaigns API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
