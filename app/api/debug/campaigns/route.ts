import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Get all campaigns with user info
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(
        `
        id,
        title,
        url,
        status,
        user_id,
        credits_allocated,
        credits_spent,
        created_at,
        profiles!inner(username, role)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      currentUserId: user.id,
      campaigns: campaigns || [],
      totalCampaigns: campaigns?.length || 0
    });
  } catch (error) {
    console.error('Error in debug campaigns API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
