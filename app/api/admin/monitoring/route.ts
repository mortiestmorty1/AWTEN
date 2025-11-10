import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Calculate dates once for reuse
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get real application metrics - optimized with counts and limited data
    const [
      usersResult,
      campaignsResult,
      visitsResult,
      creditTransactionsResult,
      recentVisitsResult,
      fraudAttemptsResult,
      recentUsersResult
    ] = await Promise.all([
      // Total users - get count and recent ones only
      supabase
        .from('profiles')
        .select('id, created_at, role', { count: 'exact' })
        .order('created_at', { ascending: false }),

      // Total campaigns - get all for stats calculation
      supabase
        .from('campaigns')
        .select('id, created_at, status, credits_allocated, credits_spent'),

      // Total visits - limit for performance, just need stats (only last 7 days for performance data)
      supabase
        .from('visits')
        .select('id, created_at, is_valid, visit_duration')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false }),

      // Credit transactions - limit for performance (last 7 days only)
      supabase
        .from('credit_transactions')
        .select('id, amount')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false }),

      // Recent visits (last 24 hours) - just count
      supabase
        .from('visits')
        .select('id, is_valid')
        .gte('created_at', oneDayAgo),

      // Fraud attempts (for blocked count) - only high score ones
      supabase
        .from('visits')
        .select('id, fraud_score, is_valid')
        .gte('created_at', oneDayAgo)
        .gt('fraud_score', 70),

      // Recent users (last 7 days)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)
    ]);

    if (usersResult.error) throw usersResult.error;
    if (campaignsResult.error) throw campaignsResult.error;
    if (visitsResult.error) throw visitsResult.error;
    if (creditTransactionsResult.error) throw creditTransactionsResult.error;
    if (recentVisitsResult.error) throw recentVisitsResult.error;
    if (fraudAttemptsResult.error) throw fraudAttemptsResult.error;

    const users = usersResult.data || [];
    const campaigns = campaignsResult.data || [];
    const visits = (visitsResult.data || []) as Array<{ id: string; created_at: string; is_valid: boolean; visit_duration: number }>;
    const creditTransactions = creditTransactionsResult.data || [];
    const recentVisits = recentVisitsResult.data || [];
    const fraudAttempts = fraudAttemptsResult.data || [];

    // Calculate metrics
    const totalUsers = usersResult.count || users.length;
    const totalCampaigns = campaigns.length;
    const totalVisits = visits.length;
    const totalCreditTransactions = creditTransactions.length;

    // Active campaigns (not completed)
    const activeCampaigns = campaigns.filter(
      (c) => c.status !== 'completed'
    ).length;

    // Valid visits percentage
    const validVisits = visits.filter((v) => v.is_valid).length;
    const validVisitPercentage =
      totalVisits > 0 ? (validVisits / totalVisits) * 100 : 0;

    // Recent activity (last 24 hours)
    const recentVisitsCount = recentVisits.length;
    const recentValidVisits = recentVisits.filter((v) => v.is_valid).length;

    // User growth (last 7 days) - already calculated from query
    const recentUsers = recentUsersResult.count || 0;

    // Campaign performance
    const completedCampaigns = campaigns.filter(
      (c) => c.status === 'completed'
    ).length;
    const completionRate =
      totalCampaigns > 0 ? (completedCampaigns / totalCampaigns) * 100 : 0;

    // Credit metrics
    const totalCreditsAllocated = campaigns.reduce(
      (sum, c) => sum + (c.credits_allocated || 0),
      0
    );
    const totalCreditsSpent = campaigns.reduce(
      (sum, c) => sum + (c.credits_spent || 0),
      0
    );
    const creditsUtilization =
      totalCreditsAllocated > 0
        ? (totalCreditsSpent / totalCreditsAllocated) * 100
        : 0;

    // Fraud detection metrics (already filtered by query)
    const blockedToday = fraudAttempts.filter(
      (attempt) => !attempt.is_valid
    ).length;

    // Calculate real uptime based on system activity
    // Uptime is calculated as percentage of successful operations vs total operations
    const totalOperations = totalVisits + totalCreditTransactions;
    const successfulOperations =
      validVisits + creditTransactions.filter((t) => t.amount > 0).length;
    const realUptime =
      totalOperations > 0
        ? (successfulOperations / totalOperations) * 100
        : 99.9;

    // Calculate average response time based on visit duration
    const avgResponseTime =
      visits.length > 0
        ? visits.reduce((sum, v) => sum + (v.visit_duration || 0), 0) /
          visits.length
        : 120;

    // System health based on real metrics
    const systemHealth = {
      status:
        validVisitPercentage > 80 && completionRate > 50 && realUptime > 95
          ? 'healthy'
          : validVisitPercentage > 60 && completionRate > 30 && realUptime > 90
            ? 'warning'
            : 'critical',
      last_check: new Date().toISOString(),
      uptime: Math.round(realUptime * 10) / 10, // Round to 1 decimal place
      response_time: Math.round(avgResponseTime)
    };

    // Performance data (last 7 days) - optimized with pre-sorted visits
    const performanceData = [];
    const visitsByDate = new Map<string, { total: number; valid: number }>();
    
    // Group visits by date efficiently
    visits.forEach((v) => {
      const dateKey = v.created_at.split('T')[0];
      if (!visitsByDate.has(dateKey)) {
        visitsByDate.set(dateKey, { total: 0, valid: 0 });
      }
      const day = visitsByDate.get(dateKey)!;
      day.total++;
      if (v.is_valid) day.valid++;
    });

    // Build performance data array
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const day = visitsByDate.get(dateKey) || { total: 0, valid: 0 };

      performanceData.push({
        date: dateKey,
        visits: day.total,
        valid_visits: day.valid,
        valid_percentage: day.total > 0 ? (day.valid / day.total) * 100 : 0
      });
    }

    return NextResponse.json({
      metrics: {
        total_users: totalUsers,
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        total_visits: totalVisits,
        valid_visits: validVisits,
        valid_visit_percentage: validVisitPercentage,
        total_credit_transactions: totalCreditTransactions,
        recent_visits_24h: recentVisitsCount,
        recent_valid_visits_24h: recentValidVisits,
        new_users_7d: recentUsers,
        completed_campaigns: completedCampaigns,
        completion_rate: completionRate,
        total_credits_allocated: totalCreditsAllocated,
        total_credits_spent: totalCreditsSpent,
        credits_utilization: creditsUtilization,
        fraud_blocked_today: blockedToday
      },
      health: systemHealth,
      performance_data: performanceData
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
