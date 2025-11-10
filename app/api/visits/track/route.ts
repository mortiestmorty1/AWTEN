import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabaseAdmin = createAdminClient();
  const { campaign_id, visitor_id } = await req.json();

  console.log('Debug: Attempting to insert visit with admin client');
  console.log('Debug: Campaign ID:', campaign_id, 'Visitor ID:', visitor_id);

  const { data, error } = await supabaseAdmin
    .from('visits')
    .insert([{ campaign_id, visitor_id }])
    .select()
    .single();

  if (error) {
    console.error('Debug: Visit insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log('Debug: Visit insert successful');
  return NextResponse.json({ visit: data });
}
