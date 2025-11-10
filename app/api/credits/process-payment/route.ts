import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe/config';

// ============================================================================
// POST /api/credits/process-payment - Process successful payment and add credits
// ============================================================================
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get user ID and credits from session metadata
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits || '0', 10);

    if (!userId || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      );
    }

    // Use admin client to add credits directly
    const supabase = createAdminClient();

    // Validate user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, credits')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.error('User not found:', userId, userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(
      `Awarding ${credits} credits to user ${userId} (current balance: ${userProfile.credits})`
    );

    const { error: creditError } = await supabase.rpc('fn_award_credits', {
      p_user_id: userId,
      p_amount: credits,
      p_reason: 'credit_purchase',
      p_ref_table: 'stripe_sessions',
      p_ref_id: null, // Stripe session ID is a string, not UUID, so pass null
      p_metadata: { session_id: sessionId }
    });

    if (creditError) {
      console.error('Error awarding credits:', creditError);
      console.error('Function parameters:', { userId, credits, sessionId });
      return NextResponse.json(
        { error: 'Failed to award credits', details: creditError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully awarded ${credits} credits to user ${userId}`);

    return NextResponse.json({
      success: true,
      credits: credits,
      message: `Successfully added ${credits} credits to your account!`
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', details: error.message },
      { status: 500 }
    );
  }
}
