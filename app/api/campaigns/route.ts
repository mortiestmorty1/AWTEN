import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Database } from '@/types_db';

type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];

// ============================================================================
// GET /api/campaigns - Get all campaigns for current user
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

    // Get user's role first, then fetch campaigns based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = (profile as any)?.role === 'admin';
    let campaigns;
    let error;

    if (isAdmin) {
      // Admin users - fetch all campaigns with limit
      const { data: adminCampaigns, error: adminError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Limit for performance
      
      campaigns = adminCampaigns;
      error = adminError;
      
      // Get usernames for admin view in parallel if campaigns exist
      if (campaigns && campaigns.length > 0) {
        const userIds = Array.from(new Set(campaigns.map((c: any) => c.user_id)));
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        const usernameMap = new Map();
        (profiles || []).forEach((p: any) => {
          usernameMap.set(p.id, p.username);
        });
        
        // Add username to each campaign
        campaigns = campaigns.map((c: any) => ({
          ...c,
          profiles: [{ username: usernameMap.get(c.user_id) || 'Unknown' }]
        }));
      }
    } else {
      // Regular users - fetch only their campaigns directly
      const { data: userCampaigns, error: userError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      campaigns = userCampaigns;
      error = userError;
    }

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaigns
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
// POST /api/campaigns - Create a new campaign
// ============================================================================
export async function POST(request: Request) {
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
    const {
      title,
      url,
      description,
      country_target,
      device_target,
      credits_allocated
    } = body;

    // Validation
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    if (!credits_allocated || credits_allocated <= 0) {
      return NextResponse.json(
        { error: 'Credits allocated must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate device target if provided
    if (
      device_target &&
      !['desktop', 'tablet', 'mobile'].includes(device_target)
    ) {
      return NextResponse.json(
        { error: 'Invalid device target. Must be desktop, tablet, or mobile' },
        { status: 400 }
      );
    }

    // Check user has enough credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).credits < credits_allocated) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaignData: CampaignInsert = {
      user_id: user.id,
      title,
      url,
      description: description || null,
      country_target: country_target || null,
      device_target: device_target || null,
      credits_allocated,
      credits_spent: 0,
      status: 'active'
    };

    const { data: campaign, error: createError } = await (supabase as any)
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating campaign:', createError);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    // Deduct credits from user's balance and log transaction
    const { error: deductError } = await (supabase as any)
      .from('profiles')
      .update({ credits: (profile as any).credits - credits_allocated })
      .eq('id', user.id);

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      // Rollback campaign creation
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      return NextResponse.json(
        { error: 'Failed to allocate credits' },
        { status: 500 }
      );
    }

    // Log credit transaction
    const { error: transactionError } = await (supabase as any)
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -credits_allocated,
        reason: 'campaign_allocation',
        ref_table: 'campaigns',
        ref_id: campaign.id
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json(
      { campaign, message: 'Campaign created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
