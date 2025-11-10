import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    const { campaign_id, url } = await request.json();

    if (!campaign_id || !url) {
      return NextResponse.json(
        { error: 'Campaign ID and URL are required' },
        { status: 400 }
      );
    }

    // Run all checks in parallel for maximum performance
    const [
      { data: campaign, error: campaignError },
      { data: existingVisits, error: visitsError },
      { data: userProfile }
    ] = await Promise.all([
      // Verify the campaign exists and get its owner and credit info
      supabase
        .from('campaigns')
        .select('user_id, title, status, credits_allocated, credits_spent')
        .eq('id', campaign_id)
        .single(),
      // Check how many times user has visited this campaign
      supabase
        .from('visits')
        .select('id')
        .eq('visitor_id', user.id)
        .eq('campaign_id', campaign_id),
      // Get user's profile to determine max visits and credit multiplier
      supabase
        .from('profiles')
        .select('role, credit_multiplier')
        .eq('id', user.id)
        .single()
    ]);

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to visit their own campaign
    if ((campaign as any).user_id === user.id) {
      return NextResponse.json(
        {
          error: 'You cannot visit your own campaign',
          self_visit: true
        },
        { status: 400 }
      );
    }

    // Check if campaign is active
    if ((campaign as any).status !== 'active') {
      return NextResponse.json(
        {
          error: 'This campaign is not active',
          inactive_campaign: true
        },
        { status: 400 }
      );
    }

    // Check if campaign has enough credits allocated
    const campaignData = campaign as any;
    const remainingCredits =
      campaignData.credits_allocated - campaignData.credits_spent;
    if (remainingCredits <= 0) {
      return NextResponse.json(
        {
          error: 'This campaign has no credits remaining',
          no_credits: true
        },
        { status: 400 }
      );
    }

    if (visitsError) {
      console.error('Error checking existing visits:', visitsError);
      return NextResponse.json(
        { error: 'Failed to check visit history' },
        { status: 500 }
      );
    }

    const visitCount = existingVisits?.length || 0;
    const maxVisits = (userProfile as any)?.role === 'premium' ? 10 : 3;

    if (visitCount >= maxVisits) {
      return NextResponse.json(
        {
          error: `You have already visited this campaign ${maxVisits} times`,
          already_visited: true,
          visit_count: visitCount,
          max_visits: maxVisits
        },
        { status: 400 }
      );
    }

    const creditMultiplier = (userProfile as any)?.credit_multiplier || 1.0;
    const creditsToEarn = Math.floor(1 * creditMultiplier);

    // Create visit record immediately using admin client
    const adminSupabase = createAdminClient();

    const { data: visit, error: visitError } = await adminSupabase
      .from('visits')
      .insert({
        visitor_id: user.id,
        campaign_id: campaign_id,
        is_valid: true,
        credits_earned: creditsToEarn,
        visit_duration: 0, // Will be updated when visit completes
        fraud_score: 0.0,
        start_time: new Date().toISOString()
      })
      .select('id')
      .single();

    if (visitError) {
      console.error('Error creating visit:', visitError);
      return NextResponse.json(
        { error: 'Failed to create visit' },
        { status: 500 }
      );
    }

    // Award credits immediately using the new function
    const { data: creditResult, error: creditError } = await adminSupabase.rpc(
      'fn_award_credits',
      {
        p_user_id: user.id,
        p_amount: creditsToEarn,
        p_reason: 'visit_earned',
        p_ref_table: 'visits',
        p_ref_id: visit.id,
        p_metadata: { campaign_id, visit_id: visit.id }
      }
    );

    if (creditError) {
      console.error('Error awarding credits:', creditError);
      // Don't fail the request, just log the error
    }

    // Deduct 1 credit from the campaign's spent credits
    const newCreditsSpent = campaignData.credits_spent + 1;
    const isCompleted = newCreditsSpent >= campaignData.credits_allocated;

    const updateData: any = {
      credits_spent: newCreditsSpent
    };

    // If all allocated credits are spent, mark campaign as completed
    if (isCompleted) {
      updateData.status = 'completed';
    }

    const { error: deductError } = await adminSupabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaign_id);

    if (deductError) {
      console.error('Error deducting credits from campaign:', deductError);
      // This is critical - if we can't deduct from campaign, we should rollback
      return NextResponse.json(
        {
          error: 'Failed to deduct credits from campaign'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visit_id: visit.id,
      credits_earned: creditsToEarn,
      credit_multiplier: creditMultiplier,
      visit_count: visitCount + 1,
      max_visits: maxVisits,
      campaign_completed: isCompleted,
      message: isCompleted
        ? `Visit recorded and credits awarded! Campaign completed! (${visitCount + 1}/${maxVisits} visits)`
        : `Visit recorded and credits awarded! (${visitCount + 1}/${maxVisits} visits)`
    });
  } catch (error) {
    console.error('Error in visit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
