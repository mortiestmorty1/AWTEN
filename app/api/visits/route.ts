import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

// ============================================================================
// GET /api/visits - Get user's visits with optional filtering
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'recent' or null for all
    const campaign_id = searchParams.get('campaign_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Calculate date filter if needed
    const weekAgo = status === 'recent' ? new Date() : null;
    if (weekAgo) {
      weekAgo.setDate(weekAgo.getDate() - 7);
    }

    // Get user's campaign IDs first (for count query)
    const { data: userCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', user.id);
    
    const campaignIds = (userCampaigns || []).map((c: any) => c.id);
    
    if (campaignIds.length === 0) {
      return NextResponse.json({
        visits: [],
        stats: { total: 0, totalCreditsEarned: 0, recentVisits: 0 },
        pagination: { total: 0, limit, offset, hasMore: false }
      });
    }

    // Build base query conditions
    let dataQuery = supabase
      .from('visits')
      .select(
        `
        *,
        campaigns!inner(
          id,
          title,
          url,
          user_id
        )
      `
      )
      .eq('campaigns.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    let countQuery = supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .in('campaign_id', campaignIds);

    // Apply filters to both queries
    if (status === 'recent' && weekAgo) {
      const weekAgoISO = weekAgo.toISOString();
      dataQuery = dataQuery.gte('created_at', weekAgoISO);
      countQuery = countQuery.gte('created_at', weekAgoISO);
    }

    if (campaign_id) {
      dataQuery = dataQuery.eq('campaign_id', campaign_id);
      countQuery = countQuery.eq('campaign_id', campaign_id);
    }

    // Run both queries in parallel
    const [{ data: visits, error }, { count, error: countError }] = await Promise.all([
      dataQuery,
      countQuery
    ]);

    if (error) {
      console.error('Error fetching visits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      );
    }

    if (countError) {
      console.error('Error fetching visit count:', countError);
    }

    // Calculate stats
    const totalVisits = visits?.length || 0;
    const totalCreditsEarned =
      visits?.reduce(
        (sum: number, v: any) => sum + (v.credits_earned || 0),
        0
      ) || 0;
    const recentVisits =
      status === 'recent'
        ? totalVisits
        : visits?.filter((v: any) => {
            const visitDate = new Date(v.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return visitDate >= weekAgo;
          }).length || 0;

    return NextResponse.json({
      visits: visits || [],
      stats: {
        total: totalVisits,
        totalCreditsEarned,
        recentVisits
      },
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
