import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { Database } from '@/types_db';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Visit = Database['public']['Tables']['visits']['Row'];
type CreditTransaction =
  Database['public']['Tables']['credit_transactions']['Row'];

// ============================================================================
// PROFILE QUERIES
// ============================================================================

/**
 * Get current user's profile with credit balance and role
 */
export const getUserProfile = cache(
  async (supabase: SupabaseClient<Database>) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  }
);

/**
 * Get profile by user ID (for agencies viewing models)
 */
export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
};

/**
 * Get all models for an agency
 */
export const getAgencyModels = cache(
  async (supabase: SupabaseClient<Database>) => {
    const { data: models, error } = await supabase
      .from('profiles')
      .select('*')
      .not('parent_agency', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agency models:', error);
      return [];
    }

    return models;
  }
);

// ============================================================================
// CAMPAIGN QUERIES
// ============================================================================

/**
 * Get all campaigns for current user
 */
export const getUserCampaigns = cache(
  async (supabase: SupabaseClient<Database>) => {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return campaigns;
  }
);

/**
 * Get active campaigns for traffic exchange (public)
 */
export const getActiveCampaigns = cache(
  async (
    supabase: SupabaseClient<Database>,
    filters?: {
      country?: string;
      device?: string;
      limit?: number;
    }
  ) => {
    let query = supabase
      .from('campaigns')
      .select('*, profiles!campaigns_user_id_fkey(username, role)')
      .eq('status', 'active')
      .gt('credits_allocated', 0)
      .order('created_at', { ascending: false });

    if (filters?.country) {
      query = query.or(
        `country_target.is.null,country_target.eq.${filters.country}`
      );
    }

    if (filters?.device) {
      query = query.or(
        `device_target.is.null,device_target.eq.${filters.device}`
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Error fetching active campaigns:', error);
      return [];
    }

    return campaigns;
  }
);

/**
 * Get campaign by ID
 */
export const getCampaignById = async (
  supabase: SupabaseClient<Database>,
  campaignId: string
) => {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*, profiles!campaigns_user_id_fkey(username, role, credits)')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }

  return campaign;
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (
  supabase: SupabaseClient<Database>,
  campaignId: string
) => {
  const { data: visits, error } = await supabase
    .from('visits')
    .select('id, is_valid, visit_duration, created_at')
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching campaign stats:', error);
    return {
      totalVisits: 0,
      validVisits: 0,
      invalidVisits: 0,
      averageSessionDuration: 0
    };
  }

  const totalVisits = visits.length;
  const validVisits = visits.filter((v) => v.is_valid).length;
  const invalidVisits = totalVisits - validVisits;
  const averageSessionDuration =
    validVisits > 0
      ? visits
          .filter((v) => v.is_valid)
          .reduce((sum, v) => sum + v.visit_duration, 0) / validVisits
      : 0;

  return {
    totalVisits,
    validVisits,
    invalidVisits,
    averageSessionDuration: Math.round(averageSessionDuration)
  };
};

// ============================================================================
// VISIT QUERIES
// ============================================================================

/**
 * Get visits for a campaign
 */
export const getCampaignVisits = cache(
  async (
    supabase: SupabaseClient<Database>,
    campaignId: string,
    limit = 50
  ) => {
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*, profiles!visits_visitor_id_fkey(username)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching campaign visits:', error);
      return [];
    }

    return visits;
  }
);

/**
 * Get user's visit history
 */
export const getUserVisits = cache(
  async (supabase: SupabaseClient<Database>, limit = 50) => {
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*, campaigns(title, url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user visits:', error);
      return [];
    }

    return visits;
  }
);

// ============================================================================
// CREDIT TRANSACTION QUERIES
// ============================================================================

/**
 * Get user's credit transaction history
 */
export const getCreditTransactions = cache(
  async (supabase: SupabaseClient<Database>, limit = 100) => {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }

    return transactions;
  }
);

/**
 * Get credit transaction summary
 */
export const getCreditSummary = async (supabase: SupabaseClient<Database>) => {
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('amount, reason, created_at');

  if (error) {
    console.error('Error fetching credit summary:', error);
    return {
      totalEarned: 0,
      totalSpent: 0,
      currentBalance: 0,
      transactionCount: 0
    };
  }

  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const currentBalance = totalEarned - totalSpent;

  return {
    totalEarned,
    totalSpent,
    currentBalance,
    transactionCount: transactions.length
  };
};

// ============================================================================
// FRAUD LOG QUERIES
// ============================================================================

/**
 * Get fraud logs for campaign visits
 */
export const getCampaignFraudLogs = async (
  supabase: SupabaseClient<Database>,
  campaignId: string
) => {
  const { data: logs, error } = await supabase
    .from('fraud_logs')
    .select(
      '*, visits!fraud_logs_visit_id_fkey(id, visitor_id, ip_address, created_at)'
    )
    .eq('visits.campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fraud logs:', error);
    return [];
  }

  return logs;
};

/**
 * Get unresolved fraud logs
 */
export const getUnresolvedFraudLogs = cache(
  async (supabase: SupabaseClient<Database>) => {
    const { data: logs, error } = await supabase
      .from('fraud_logs')
      .select('*, visits!fraud_logs_visit_id_fkey(*)')
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unresolved fraud logs:', error);
      return [];
    }

    return logs;
  }
);

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

/**
 * Get complete dashboard data for user
 */
export const getDashboardData = async (supabase: SupabaseClient<Database>) => {
  const [profile, campaigns, visits, transactions] = await Promise.all([
    getUserProfile(supabase),
    getUserCampaigns(supabase),
    getUserVisits(supabase),
    getCreditTransactions(supabase)
  ]);

  return {
    profile,
    campaigns,
    visits,
    transactions
  };
};
