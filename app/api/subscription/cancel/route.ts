import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe/config';

// ============================================================================
// POST /api/subscription/cancel - Cancel user's premium subscription
// ============================================================================
export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      );
    }

    // Get user's profile to check current role

    // Get profile data
    let { data: profile, error: profileError } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    console.log('📊 Profile query result:', { profile, profileError });

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      return NextResponse.json(
        { error: 'User profile not found', details: profileError?.message },
        { status: 404 }
      );
    }

    // Get customer data for Stripe customer ID
    console.log('🔍 Looking for customer data for user ID:', user.id);
    let { data: customer, error: customerError } = (await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    console.log('📊 Customer query result:', { customer, customerError });

    // If customer not found, create one
    if (customerError || !customer) {
      console.log('🔄 Customer not found, creating new customer...');
      const adminSupabase = createAdminClient();
      const { data: newCustomer, error: createError } = (await adminSupabase
        .from('customers')
        .insert({
          id: user.id,
          stripe_customer_id: null // Will be set when they make their first purchase
        })
        .select('stripe_customer_id')
        .single()) as { data: any; error: any };

      if (createError) {
        console.error('❌ Failed to create customer:', createError);
        return NextResponse.json(
          {
            error: 'Failed to create customer record',
            details: createError?.message
          },
          { status: 500 }
        );
      }

      customer = newCustomer;
    }

    if (profile.role !== 'premium') {
      return NextResponse.json(
        { error: 'User is not a premium subscriber' },
        { status: 400 }
      );
    }

    // Check if user has a Stripe customer ID
    if (!customer.stripe_customer_id) {
      console.log('⚠️ User has no Stripe customer ID, downgrading to free');

      // Just downgrade the user to free since they have no Stripe subscription
      const adminSupabase = createAdminClient();
      const { error: downgradeError } = await adminSupabase
        .from('profiles')
        .update({
          role: 'free',
          credit_multiplier: 1.0,
          campaign_limit: 3
        })
        .eq('id', user.id);

      if (downgradeError) {
        console.error('❌ Error downgrading user:', downgradeError);
        return NextResponse.json(
          { error: 'Failed to downgrade user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Account downgraded to free (no active subscription found)'
      });
    }

    // Get customer's active subscriptions from Stripe
    console.log(
      '🔍 Looking for Stripe subscriptions for customer:',
      customer.stripe_customer_id
    );
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripe_customer_id,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      // No active subscription found, just downgrade the user
      console.log(
        `No active subscription found for user ${user.id}, downgrading to free`
      );

      const adminSupabase = createAdminClient();
      const { error: downgradeError } = await adminSupabase
        .from('profiles')
        .update({
          role: 'free',
          credit_multiplier: 1.0,
          campaign_limit: 3
        })
        .eq('id', user.id);

      if (downgradeError) {
        console.error('Error downgrading user:', downgradeError);
        return NextResponse.json(
          { error: 'Failed to downgrade user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled and account downgraded to free'
      });
    }

    // Cancel all active subscriptions
    const cancelledSubscriptions = [];
    for (const subscription of subscriptions.data) {
      try {
        const cancelledSubscription = await stripe.subscriptions.cancel(
          subscription.id
        );
        cancelledSubscriptions.push(cancelledSubscription.id);
        console.log(
          `Cancelled subscription ${subscription.id} for user ${user.id}`
        );
      } catch (error) {
        console.error(
          `Error cancelling subscription ${subscription.id}:`,
          error
        );
      }
    }

    // Downgrade user to free
    const adminSupabase = createAdminClient();
    const { error: downgradeError } = await adminSupabase
      .from('profiles')
      .update({
        role: 'free',
        credit_multiplier: 1.0,
        campaign_limit: 3
      })
      .eq('id', user.id);

    if (downgradeError) {
      console.error('Error downgrading user:', downgradeError);
      return NextResponse.json(
        { error: 'Failed to downgrade user' },
        { status: 500 }
      );
    }

    console.log(
      `Successfully cancelled ${cancelledSubscriptions.length} subscriptions and downgraded user ${user.id} to free`
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancelledSubscriptions
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}
