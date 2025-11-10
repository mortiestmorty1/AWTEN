import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

// ============================================================================
// GET /api/analytics - Get user analytics and dashboard stats
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
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const startDateISO = startDate.toISOString();

    // Run all queries in parallel for maximum performance
    const [
      { data: campaigns, error: campaignsError },
      { data: visits, error: visitsError },
      { data: profile, error: profileError },
      { data: transactions, error: transactionsError }
    ] = await Promise.all([
      // Get campaign stats
      supabase
        .from('campaigns')
        .select('id, title, status, credits_allocated, credits_spent, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDateISO),
      // Get visit stats - filter by user's campaigns at database level
      supabase
        .from('visits')
        .select('id, campaign_id, credits_earned, created_at, campaigns!inner(id, user_id)')
        .eq('campaigns.user_id', user.id)
        .gte('created_at', startDateISO),
      // Get user profile with credit stats
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      // Get credit transaction stats for detailed breakdown
      supabase
        .from('credit_transactions')
        .select('amount, reason, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDateISO)
    ]);

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
    }
    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
    }
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    // Visits are already filtered by database join
    const userVisits = visits || [];

    // Calculate analytics
    const campaignStats = {
      total: campaigns?.length || 0,
      active: campaigns?.filter((c: any) => c.status === 'active').length || 0,
      paused: campaigns?.filter((c: any) => c.status === 'paused').length || 0,
      completed:
        campaigns?.filter((c: any) => c.status === 'completed').length || 0,
      totalCreditsAllocated:
        campaigns?.reduce(
          (sum: number, c: any) => sum + c.credits_allocated,
          0
        ) || 0,
      totalCreditsSpent:
        campaigns?.reduce((sum: number, c: any) => sum + c.credits_spent, 0) ||
        0
    };

    const visitStats = {
      total: userVisits.length,
      totalCreditsEarned: userVisits.reduce(
        (sum: number, v: any) => sum + (v.credits_earned || 0),
        0
      ),
      recentVisits: userVisits.filter((v: any) => {
        const visitDate = new Date(v.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return visitDate >= weekAgo;
      }).length
    };

    // Calculate credit stats - separate earned from visits vs purchased
    const earnedFromVisits =
      transactions?.filter(
        (t: any) =>
          t.amount > 0 &&
          (t.reason?.includes('visit') || t.reason?.includes('validated'))
      ) || [];

    const purchasedTransactions =
      transactions?.filter(
        (t: any) =>
          t.amount > 0 &&
          (t.reason?.includes('purchase') ||
            t.reason?.includes('credit_purchase') ||
            t.reason?.includes('premium_subscription'))
      ) || [];

    const spentTransactions =
      transactions?.filter((t: any) => t.amount < 0) || [];

    // Use profile stats as primary source, calculate earned from visits separately
    const creditStats = {
      totalEarned: earnedFromVisits.reduce(
        (sum: number, t: any) => sum + t.amount,
        0
      ), // Only from visits
      totalSpent:
        (profile as any)?.credits_spent ||
        Math.abs(
          spentTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
        ),
      totalPurchased:
        (profile as any)?.credits_purchased ||
        purchasedTransactions.reduce(
          (sum: number, t: any) => sum + t.amount,
          0
        ),
      totalAllocated: (profile as any)?.credits_allocated || 0
    };

    // Daily stats for charts (last 30 days) - optimized with Map grouping
    const dailyStats = [];
    const visitsByDate = new Map<string, { count: number; credits: number }>();
    
    // Group visits by date efficiently (O(n) instead of O(n*m))
    userVisits.forEach((v: any) => {
      const dateKey = v.created_at.split('T')[0];
      if (!visitsByDate.has(dateKey)) {
        visitsByDate.set(dateKey, { count: 0, credits: 0 });
      }
      const day = visitsByDate.get(dateKey)!;
      day.count++;
      day.credits += v.credits_earned || 0;
    });

    // Build daily stats array
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const day = visitsByDate.get(dateStr) || { count: 0, credits: 0 };

      dailyStats.push({
        date: dateStr,
        visits: day.count,
        creditsEarned: day.credits
      });
    }

    // Top performing campaigns - optimized with Map grouping
    const visitsByCampaign = new Map<string, { count: number; credits: number }>();
    
    // Group visits by campaign efficiently (O(n) instead of O(n*m))
    userVisits.forEach((v: any) => {
      const campaignId = v.campaign_id;
      if (!visitsByCampaign.has(campaignId)) {
        visitsByCampaign.set(campaignId, { count: 0, credits: 0 });
      }
      const camp = visitsByCampaign.get(campaignId)!;
      camp.count++;
      camp.credits += v.credits_earned || 0;
    });

    const campaignPerformance =
      campaigns
        ?.map((campaign: any) => {
          const campStats = visitsByCampaign.get(campaign.id) || { count: 0, credits: 0 };

          return {
            id: campaign.id,
            title: campaign.title,
            visits: campStats.count,
            creditsEarned: campStats.credits,
            creditsSpent: campaign.credits_spent,
            creditsAllocated: campaign.credits_allocated,
            status: campaign.status
          };
        })
        .sort((a: any, b: any) => b.creditsEarned - a.creditsEarned) || [];

    return NextResponse.json({
      period: parseInt(period),
      campaigns: campaignStats,
      visits: visitStats,
      credits: creditStats,
      dailyStats,
      topCampaigns: campaignPerformance.slice(0, 5),
      summary: {
        totalCampaigns: campaignStats.total,
        totalVisits: visitStats.total,
        totalCreditsEarned: creditStats.totalEarned, // Only from visits
        totalCreditsSpent: creditStats.totalSpent,
        totalCreditsPurchased: creditStats.totalPurchased,
        currentBalance: (profile as any)?.credits || 0, // Direct from profile
        netCredits: (profile as any)?.credits || 0 // Current balance is the net
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
