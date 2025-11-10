import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';

interface FraudAttempt {
  id: string;
  user_id: string;
  username: string;
  email: string;
  type: 'suspicious_visit' | 'bot_activity' | 'credit_manipulation';
  severity: 'low' | 'medium' | 'critical';
  status: 'reviewed' | 'blocked' | 'false_positive';
  description: string;
  detected_at: string;
  ip_address: string;
  user_agent: string;
  score: number;
}

interface Visit {
  id: string;
  visitor_id: string;
  campaign_id: string;
  is_valid: boolean;
  visit_duration: number;
  fraud_score: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  created_at: string;
  credits: number;
  role: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Get real fraud detection data based on actual application behavior
    const [
      visitsResult,
      usersResult,
      creditTransactionsResult,
      campaignsResult
    ] = await Promise.all([
      // Get recent visits with fraud scores (last 30 days only for performance)
      supabase
        .from('visits')
        .select('id, visitor_id, campaign_id, is_valid, visit_duration, fraud_score, start_time, end_time, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(300), // Further reduced limit

      // Get user profiles for analysis - limit to recent users
      supabase
        .from('profiles')
        .select('id, username, created_at, credits, role')
        .order('created_at', { ascending: false })
        .limit(300), // Reduced limit

      // Get credit transactions for analysis - last 30 days only
      supabase
        .from('credit_transactions')
        .select('id, user_id, amount, reason, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(200), // Further reduced limit

      // Get campaigns separately to avoid join issues - limit to active/recent
      supabase
        .from('campaigns')
        .select('id, user_id, title')
        .order('created_at', { ascending: false })
        .limit(300) // Further reduced limit
    ]);

    if (visitsResult.error) throw visitsResult.error;
    if (usersResult.error) throw usersResult.error;
    if (creditTransactionsResult.error) throw creditTransactionsResult.error;
    if (campaignsResult.error) throw campaignsResult.error;

    const visits = visitsResult.data || [];
    const users = usersResult.data || [];
    const creditTransactions = creditTransactionsResult.data || [];
    const campaigns = campaignsResult.data || [];

    // Create a campaign map for easy lookup
    const campaignMap = campaigns.reduce(
      (acc, campaign) => {
        acc[campaign.id] = campaign;
        return acc;
      },
      {} as Record<string, any>
    );

    // Analyze visits for suspicious patterns
    const suspiciousVisits = analyzeSuspiciousVisits(
      visits as any,
      campaignMap
    );

    // Analyze users for suspicious behavior
    const suspiciousUsers = analyzeSuspiciousUsers(
      users as any,
      visits as any,
      creditTransactions as any
    );

    // Analyze credit transactions for manipulation
    const suspiciousTransactions = analyzeSuspiciousTransactions(
      creditTransactions as any
    );

    // Combine all fraud attempts
    const fraudAttempts = [
      ...suspiciousVisits,
      ...suspiciousUsers,
      ...suspiciousTransactions
    ].sort(
      (a, b) =>
        new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
    );

    // Calculate fraud statistics
    const stats = calculateFraudStats(fraudAttempts);

    return NextResponse.json({
      fraudAttempts,
      stats,
      analysis: {
        totalVisitsAnalyzed: visits.length,
        totalUsersAnalyzed: users.length,
        totalTransactionsAnalyzed: creditTransactions.length,
        suspiciousPatternsFound: fraudAttempts.length
      }
    });
  } catch (error) {
    console.error('Error fetching fraud data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud data' },
      { status: 500 }
    );
  }
}

// Analyze visits for suspicious patterns
function analyzeSuspiciousVisits(
  visits: Visit[],
  campaignMap: Record<string, any>
): FraudAttempt[] {
  const suspiciousVisits: FraudAttempt[] = [];

  // Group visits by visitor_id to find patterns
  const visitsByUser = visits.reduce(
    (acc, visit) => {
      if (!acc[visit.visitor_id]) {
        acc[visit.visitor_id] = [];
      }
      acc[visit.visitor_id].push(visit);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Check for suspicious patterns
  Object.entries(visitsByUser).forEach(([userId, userVisits]) => {
    if (userVisits.length < 2) return;

    // Pattern 1: Too many visits in short time
    const recentVisits = userVisits.filter(
      (v) => new Date(v.created_at) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (recentVisits.length > 10) {
      suspiciousVisits.push({
        id: `rapid_visits_${userId}`,
        user_id: userId,
        username: 'Unknown', // We'll need to get this from users data
        email: 'N/A', // We don't store email in visits
        type: 'suspicious_visit',
        severity: recentVisits.length > 20 ? 'critical' : 'medium',
        status: 'reviewed',
        description: `${recentVisits.length} visits in the last hour from user ${userId}`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A', // Not stored in current schema
        user_agent: 'N/A', // Not stored in current schema
        score: Math.min(recentVisits.length * 5, 100)
      });
    }

    // Pattern 2: Very short visit durations (bot-like behavior)
    const shortVisits = userVisits.filter((v) => v.visit_duration < 5); // Less than 5 seconds
    if (shortVisits.length > userVisits.length * 0.8) {
      // 80% of visits are very short
      suspiciousVisits.push({
        id: `short_visits_${userId}`,
        user_id: userId,
        username: 'Unknown', // We'll need to get this from users data
        email: 'N/A',
        type: 'bot_activity',
        severity: 'medium',
        status: 'reviewed',
        description: `${shortVisits.length}/${userVisits.length} visits were extremely short (< 5 seconds)`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A',
        user_agent: 'N/A',
        score: Math.min(shortVisits.length * 10, 100)
      });
    }

    // Pattern 3: Same user visiting their own campaigns
    const selfVisits = userVisits.filter((v) => {
      const campaign = campaignMap[v.campaign_id];
      return campaign && campaign.user_id === userId;
    });
    if (selfVisits.length > 0) {
      suspiciousVisits.push({
        id: `self_visits_${userId}`,
        user_id: userId,
        username: 'Unknown', // We'll need to get this from users data
        email: 'N/A',
        type: 'credit_manipulation',
        severity: 'critical',
        status: 'reviewed',
        description: `User visited their own campaign ${selfVisits.length} times`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A',
        user_agent: 'N/A',
        score: 95
      });
    }
  });

  return suspiciousVisits;
}

// Analyze users for suspicious behavior
function analyzeSuspiciousUsers(
  users: User[],
  visits: Visit[],
  transactions: Transaction[]
): FraudAttempt[] {
  const suspiciousUsers: FraudAttempt[] = [];

  users.forEach((user) => {
    const userVisits = visits.filter((v) => v.visitor_id === user.id);
    const userTransactions = transactions.filter((t) => t.user_id === user.id);

    // Pattern 1: New user with high credit balance
    const isNewUser =
      new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Created in last 24h
    if (isNewUser && user.credits > 100) {
      suspiciousUsers.push({
        id: `new_user_high_credits_${user.id}`,
        user_id: user.id,
        username: user.username,
        email: 'N/A',
        type: 'credit_manipulation',
        severity: 'medium',
        status: 'reviewed',
        description: `New user (${user.username}) has unusually high credits: ${user.credits}`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A',
        user_agent: 'N/A',
        score: Math.min(user.credits / 10, 100)
      });
    }

    // Pattern 2: User with many failed visits
    const failedVisits = userVisits.filter((v) => !v.is_valid);
    if (failedVisits.length > userVisits.length * 0.7) {
      // 70% failed visits
      suspiciousUsers.push({
        id: `high_failure_rate_${user.id}`,
        user_id: user.id,
        username: user.username,
        email: 'N/A',
        type: 'suspicious_visit',
        severity: 'medium',
        status: 'reviewed',
        description: `User has high visit failure rate: ${failedVisits.length}/${userVisits.length} failed`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A',
        user_agent: 'N/A',
        score: Math.min(failedVisits.length * 15, 100)
      });
    }
  });

  return suspiciousUsers;
}

// Analyze credit transactions for manipulation
function analyzeSuspiciousTransactions(
  transactions: Transaction[]
): FraudAttempt[] {
  const suspiciousTransactions: FraudAttempt[] = [];

  // Group transactions by user
  const transactionsByUser = transactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.user_id]) {
        acc[transaction.user_id] = [];
      }
      acc[transaction.user_id].push(transaction);
      return acc;
    },
    {} as Record<string, any[]>
  );

  Object.entries(transactionsByUser).forEach(([userId, userTransactions]) => {
    // Pattern 1: Rapid credit earning
    const recentTransactions = userTransactions.filter(
      (t) => new Date(t.created_at) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    const earnedCredits = recentTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    if (earnedCredits > 50) {
      // More than 50 credits in an hour
      suspiciousTransactions.push({
        id: `rapid_credit_earning_${userId}`,
        user_id: userId,
        username: 'Unknown', // Would need to join with profiles
        email: 'N/A',
        type: 'credit_manipulation',
        severity: 'critical',
        status: 'reviewed',
        description: `User earned ${earnedCredits} credits in the last hour`,
        detected_at: new Date().toISOString(),
        ip_address: 'N/A',
        user_agent: 'N/A',
        score: Math.min(earnedCredits * 2, 100)
      });
    }
  });

  return suspiciousTransactions;
}

// Calculate fraud statistics
function calculateFraudStats(fraudAttempts: FraudAttempt[]) {
  const totalAttempts = fraudAttempts.length;
  const blockedToday = fraudAttempts.filter(
    (attempt) =>
      attempt.status === 'blocked' &&
      new Date(attempt.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const falsePositives = fraudAttempts.filter(
    (attempt) => attempt.status === 'false_positive'
  ).length;

  const averageScore =
    fraudAttempts.length > 0
      ? fraudAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        fraudAttempts.length
      : 0;

  return {
    totalAttempts,
    blockedToday,
    falsePositives,
    averageScore: Math.round(averageScore * 10) / 10
  };
}
