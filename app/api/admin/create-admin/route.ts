import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update user role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        credits: 10000 // Give admin user extra credits for testing
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user to admin:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User successfully promoted to admin',
      profile: data
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      {
        error: 'Failed to create admin user'
      },
      { status: 500 }
    );
  }
}
