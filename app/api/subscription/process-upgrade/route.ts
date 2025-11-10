import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe/config';

// ============================================================================
// POST /api/subscription/process-upgrade - Process subscription upgrade immediately
// ============================================================================
export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription']
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check if this is a premium subscription
    if (session.metadata?.type !== 'premium_subscription') {
      return NextResponse.json(
        { error: 'Not a premium subscription' },
        { status: 400 }
      );
    }

    const planId = session.metadata.plan_id;

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!planId || !subscriptionId) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Use admin client to upgrade user
    const adminSupabase = createAdminClient();

    // Update user role to premium
    const { error: roleError } = await adminSupabase
      .from('profiles')
      .update({
        role: 'premium',
        credit_multiplier: 1.2,
        campaign_limit: 999 // Unlimited campaigns for premium
      })
      .eq('id', user.id);

    if (roleError) {
      console.error('Error updating user role:', roleError);
      return NextResponse.json(
        { error: `Failed to upgrade user to premium: ${roleError.message}` },
        { status: 500 }
      );
    }

    // Award initial premium credits based on plan
    const creditsToAward = planId === 'premium_yearly' ? 6000 : 500;

    const { error: creditError } = await adminSupabase.rpc('fn_award_credits', {
      p_user_id: user.id,
      p_amount: creditsToAward,
      p_reason: 'premium_subscription',
      p_ref_table: 'subscriptions',
      p_ref_id: null, // Stripe subscription IDs are not UUIDs
      p_metadata: JSON.stringify({
        plan_id: planId,
        subscription_id: subscriptionId
      })
    });

    if (creditError) {
      console.error('Error awarding credits:', creditError);
      // Don't fail the upgrade if credits fail
    }

    // Verify the upgrade worked
    const { data: updatedProfile, error: verifyError } = await adminSupabase
      .from('profiles')
      .select('id, role, credits, credit_multiplier, campaign_limit')
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.error('Error verifying upgrade:', verifyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Premium upgrade processed successfully',
      creditsAwarded: creditsToAward,
      planId,
      userRole: updatedProfile?.role,
      creditMultiplier: updatedProfile?.credit_multiplier,
      campaignLimit: updatedProfile?.campaign_limit
    });
  } catch (error: any) {
    console.error('Error processing subscription upgrade:', error);
    return NextResponse.json(
      {
        error: 'Failed to process subscription upgrade',
        details: error.message
      },
      { status: 500 }
    );
  }
}
