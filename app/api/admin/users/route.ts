import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Get all users with their profiles and auth data in parallel
    const [
      { data: users, error: usersError },
      { data: authUsers, error: authError }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, role, credits, created_at, updated_at')
        .order('created_at', { ascending: false }),
      supabase.auth.admin.listUsers()
    ]);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Create a map of user ID to email
    const emailMap = (authUsers?.users || []).reduce(
      (acc, user) => {
        if (user.email) {
          acc[user.id] = user.email;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Get user IDs and fetch visits in parallel if we have users
    const userIds = users?.map((user) => user.id) || [];
    
    // Get visit statistics for each user
    const { data: visits, error: visitsError } = userIds.length > 0
      ? await supabase
          .from('visits')
          .select('visitor_id, is_valid')
          .in('visitor_id', userIds)
      : { data: null, error: null };

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
      return NextResponse.json({ error: visitsError.message }, { status: 500 });
    }

    // Calculate visit counts for each user
    const visitCounts =
      visits?.reduce(
        (acc, visit) => {
          const userId = visit.visitor_id;
          if (!acc[userId]) {
            acc[userId] = { total: 0, valid: 0 };
          }
          acc[userId].total++;
          if (visit.is_valid) {
            acc[userId].valid++;
          }
          return acc;
        },
        {} as Record<string, { total: number; valid: number }>
      ) || {};

    // Transform users data
    const transformedUsers =
      users?.map((user) => ({
        id: user.id,
        username: user.username,
        email: emailMap[user.id] || 'N/A',
        role: user.role,
        credits: user.credits || 0,
        total_visits: visitCounts[user.id]?.total || 0,
        created_at: user.created_at,
        last_active: user.updated_at
      })) || [];

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const updates = await req.json();
    const supabase = createAdminClient();

    // Only allow username updates for security
    if (!updates.id || !updates.username) {
      return NextResponse.json(
        { error: 'User ID and username are required' },
        { status: 400 }
      );
    }

    // Update only the username
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', updates.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user'
      },
      { status: 500 }
    );
  }
}
