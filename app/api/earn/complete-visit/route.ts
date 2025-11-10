import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';

interface VisitData {
  id: string;
  visitor_id: string;
  campaign_id: string;
  is_valid: boolean;
  credits_earned: number;
  visit_duration: number;
  fraud_score: number;
}

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

    const { visit_id, duration = 0, fraud_score = 0.0 } = await request.json();

    if (!visit_id) {
      return NextResponse.json(
        { error: 'Visit ID is required' },
        { status: 400 }
      );
    }

    // Update the visit record with duration using admin client
    const adminSupabase = createAdminClient();

    const { error: updateError } = await adminSupabase
      .from('visits')
      .update({
        visit_duration: duration,
        fraud_score: fraud_score,
        end_time: new Date().toISOString()
      })
      .eq('id', visit_id)
      .eq('visitor_id', user.id);

    if (updateError) {
      console.error('Error updating visit:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Visit completed successfully!'
    });
  } catch (error) {
    console.error('Error in complete-visit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
