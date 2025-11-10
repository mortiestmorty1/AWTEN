import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe/config';
import { createOrRetrieveCustomer } from '@/lib/utils/supabase/admin';

// Premium subscription plans
const PREMIUM_PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 1999, // $19.99
    interval: 'month',
    credits: 500,
    description: 'Premium features with 500 monthly credits'
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 19999, // $199.99 (17% discount)
    interval: 'year',
    credits: 6000,
    description: 'Premium features with 6000 yearly credits'
  }
];

// ============================================================================
// POST /api/subscription/create - Create Stripe checkout session for premium subscription
// ============================================================================
export async function POST(request: Request) {
  try {
    // Use admin client for database operations
    const supabase = createAdminClient();

    // Still need regular client for auth
    const supabaseClient = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { plan_id } = body;

    // Validate plan
    const selectedPlan = PREMIUM_PLANS.find((plan) => plan.id === plan_id);
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Check if user is already premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'premium') {
      return NextResponse.json(
        { error: 'You are already a premium user' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email || ''
    });

    // Create Stripe checkout session for subscription
    const metadata = {
      user_id: user.id,
      plan_id: selectedPlan.id,
      credits: selectedPlan.credits.toString(),
      type: 'premium_subscription'
    };

    const session = await stripe.checkout.sessions.create({
      customer: customer,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: selectedPlan.interval as 'month' | 'year'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription/cancelled`,
      metadata: metadata
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Error creating subscription checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create subscription checkout session',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/subscription/create - Get available subscription plans
// ============================================================================
export async function GET(request: Request) {
  try {
    const supabaseClient = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available plans with calculated savings
    const plans = PREMIUM_PLANS.map((plan) => {
      const monthlyPrice =
        plan.interval === 'year' ? plan.price / 12 : plan.price;
      const savings = plan.interval === 'year' ? 17 : 0; // 17% savings for yearly

      return {
        ...plan,
        priceDisplay: `$${(plan.price / 100).toFixed(2)}`,
        monthlyPrice: `$${(monthlyPrice / 100).toFixed(2)}`,
        savings,
        isPopular: plan.id === 'premium_monthly',
        isBestValue: plan.id === 'premium_yearly'
      };
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
