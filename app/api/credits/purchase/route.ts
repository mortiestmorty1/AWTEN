import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe/config';
import { createOrRetrieveCustomer } from '@/lib/utils/supabase/admin';
import type { Database } from '@/types_db';

// Create admin client - uses SERVICE_ROLE key
const supabase = createAdminClient();

// Credit packages (can be moved to database later)
const CREDIT_PACKAGES = [
  { credits: 100, price: 999, id: 'credit_100' }, // $9.99
  { credits: 500, price: 3999, id: 'credit_500' }, // $39.99 (20% discount)
  { credits: 1000, price: 6999, id: 'credit_1000' }, // $69.99 (30% discount)
  { credits: 5000, price: 29999, id: 'credit_5000' } // $299.99 (40% discount)
];

// ============================================================================
// POST /api/credits/purchase - Create Stripe checkout session for credits
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
    const { package_id } = body;

    // Validate package
    const selectedPackage = CREDIT_PACKAGES.find(
      (pkg) => pkg.id === package_id
    );
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email || ''
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPackage.credits} Credits`,
              description: `Purchase ${selectedPackage.credits} credits for AWTEN traffic exchange`
            },
            unit_amount: selectedPackage.price
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/credits/cancelled`,
      metadata: {
        user_id: user.id,
        credits: selectedPackage.credits.toString(),
        package_id: selectedPackage.id,
        type: 'credit_purchase'
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/credits/purchase - Get available credit packages
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

    // Return available packages with calculated discounts
    const packages = CREDIT_PACKAGES.map((pkg) => {
      const basePrice = 999; // $9.99 for 100 credits
      const basePricePerCredit = basePrice / 100;
      const packagePricePerCredit = pkg.price / pkg.credits;
      const discountPercent = Math.round(
        ((basePricePerCredit - packagePricePerCredit) / basePricePerCredit) *
          100
      );

      return {
        ...pkg,
        priceDisplay: `$${(pkg.price / 100).toFixed(2)}`,
        pricePerCredit: (pkg.price / pkg.credits / 100).toFixed(4),
        discountPercent,
        isPopular: pkg.credits === 500,
        isBestValue: pkg.credits === 5000
      };
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
