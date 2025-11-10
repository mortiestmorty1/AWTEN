import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

// ============================================================================
// GET /api/profile - Get current user's profile with credits and stats
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

    // Run all queries in parallel for better performance
    const [
      { data: profile, error: profileError },
      { data: campaigns },
      { data: visits },
      { data: recentCampaigns },
      { data: recentTransactions }
    ] = await Promise.all([
      // Get user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      // Get campaign statistics
      supabase
        .from('campaigns')
        .select('id, status, credits_allocated, credits_spent')
        .eq('user_id', user.id),
      // Get visit statistics - limit to recent visits for performance
      supabase
        .from('visits')
        .select('id, is_valid, created_at, campaigns!inner(id, user_id)')
        .eq('campaigns.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000), // Limit for performance
      // Recent campaigns (last 5)
      supabase
        .from('campaigns')
        .select('id, title, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5),
      // Recent credit transactions (last 5)
      supabase
        .from('credit_transactions')
        .select('id, amount, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Process campaign statistics
    const campaignStats = {
      total: campaigns?.length || 0,
      active: campaigns?.filter((c: any) => c.status === 'active').length || 0,
      paused: campaigns?.filter((c: any) => c.status === 'paused').length || 0,
      completed:
        campaigns?.filter((c: any) => c.status === 'completed').length || 0,
      totalCreditsAllocated:
        campaigns?.reduce(
          (sum: number, c: any) => sum + (c.credits_allocated || 0),
          0
        ) || 0,
      totalCreditsSpent:
        campaigns?.reduce((sum: number, c: any) => sum + (c.credits_spent || 0), 0) ||
        0
    };

    // Process visit statistics (already filtered by database)
    const userVisits = visits || [];
    const visitStats = {
      total: userVisits.length,
      valid: userVisits.filter((v: any) => v.is_valid).length || 0,
      pending: userVisits.filter((v: any) => !v.is_valid).length || 0
    };

    // Build recent activities array
    const recentActivities: any[] = [];

    // Add recent campaigns
    if (recentCampaigns) {
      recentCampaigns.forEach((campaign: any) => {
        recentActivities.push({
          id: campaign.id,
          type: 'campaign',
          title: campaign.title,
          description: `Campaign ${campaign.status}`,
          timestamp: campaign.updated_at || campaign.created_at,
          status: campaign.status
        });
      });
    }

    // Add recent visits (already sorted by created_at from query)
    const recentVisits = userVisits
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    recentVisits.forEach((visit: any) => {
      recentActivities.push({
        id: visit.id,
        type: 'visit',
        title: 'New Visit',
        description: visit.is_valid ? 'Valid visit received' : 'Visit pending validation',
        timestamp: visit.created_at,
        status: visit.is_valid ? 'valid' : 'pending'
      });
    });

    if (recentTransactions) {
      recentTransactions.forEach((transaction: any) => {
        const isEarned = transaction.amount > 0;
        recentActivities.push({
          id: transaction.id,
          type: 'transaction',
          title: isEarned ? 'Credits Earned' : 'Credits Spent',
          description: `${Math.abs(transaction.amount)} credits ${isEarned ? 'earned' : 'spent'} - ${transaction.reason}`,
          timestamp: transaction.created_at,
          status: isEarned ? 'earned' : 'spent'
        });
      });
    }

    // Sort all activities by timestamp and take the most recent 10
    const sortedActivities = recentActivities
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Removed agency and model logic - not in current implementation
    // let models = null; // Removed - no longer needed
    // let parentAgency = null; // Removed - no longer needed

    return NextResponse.json({
      profile,
      stats: {
        campaigns: campaignStats,
        visits: visitStats
      },
      recentActivities: sortedActivities
      // models, // Removed - no longer needed
      // parentAgency, // Removed - no longer needed
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/profile - Update user profile
// ============================================================================
export async function PATCH(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { username, country } = body;

    // Build update object
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (country !== undefined) updateData.country = country;

    // Validate username format
    if (username) {
      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 30 characters' },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          {
            error: 'Username can only contain letters, numbers, and underscores'
          },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update profile (RLS ensures user can only update their own)
    const { data: updatedProfile, error: updateError } = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
