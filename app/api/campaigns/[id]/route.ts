import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Database } from '@/types_db';

type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

// ============================================================================
// GET /api/campaigns/[id] - Get specific campaign
// ============================================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: campaignId } = await params;

    // Check if user is admin and get campaign in parallel
    const [{ data: profile }, { data: campaign, error }] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
      // Get campaign first - we'll verify access after
      supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
    ]);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error fetching campaign:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    const isAdmin = (profile as any)?.role === 'admin';

    // Verify access - admin can view any, regular users only their own
    if (!isAdmin && (campaign as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 404 }
      );
    }

    // Get visit statistics - limit for performance
    const { data: visits } = await supabase
      .from('visits')
      .select('id, is_valid, visit_duration')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(1000); // Limit for performance

    const validVisits = visits?.filter((v: any) => v.is_valid) || [];

    const stats = {
      totalVisits: visits?.length || 0,
      validVisits: validVisits.length,
      invalidVisits: visits?.filter((v: any) => !v.is_valid).length || 0,
      averageSessionDuration:
        validVisits.length > 0
          ? Math.round(
              validVisits.reduce(
                (sum: number, v: any) => sum + (v.visit_duration || 0),
                0
              ) / validVisits.length
            )
          : 0
    };

    return NextResponse.json({ campaign, stats });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/campaigns/[id] - Update campaign
// ============================================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: campaignId } = await params;

    // Parse request body
    const body = await request.json();
    const {
      title,
      url,
      description,
      country_target,
      device_target,
      credits_allocated,
      status
    } = body;

    // Validation
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    if (
      device_target &&
      !['desktop', 'tablet', 'mobile'].includes(device_target)
    ) {
      return NextResponse.json(
        { error: 'Invalid device target. Must be desktop, tablet, or mobile' },
        { status: 400 }
      );
    }

    if (
      status &&
      !['active', 'paused', 'completed', 'deleted'].includes(status)
    ) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be active, paused, completed, or deleted'
        },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: CampaignUpdate = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (description !== undefined) updateData.description = description;
    if (country_target !== undefined)
      updateData.country_target = country_target;
    if (device_target !== undefined) updateData.device_target = device_target;
    if (credits_allocated !== undefined)
      updateData.credits_allocated = credits_allocated;
    if (status !== undefined) updateData.status = status;

    // Handle credit allocation changes
    if (credits_allocated !== undefined) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('credits_allocated, credits_spent, title, user_id')
        .eq('id', campaignId)
        .single();
      
      // Verify ownership
      if (!campaign || (campaign as any).user_id !== user.id) {
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }

      const currentAllocated = (campaign as any).credits_allocated;
      const creditsSpent = (campaign as any).credits_spent;
      const creditDifference = credits_allocated - currentAllocated;

      // Ensure credits_allocated >= credits_spent
      if (credits_allocated < creditsSpent) {
        return NextResponse.json(
          { error: 'Cannot set credits_allocated below credits_spent' },
          { status: 400 }
        );
      }

      // Get user profile for credit operations
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      // If increasing allocation, check user has enough credits
      if (creditDifference > 0) {
        if (!profile || (profile as any).credits < creditDifference) {
          return NextResponse.json(
            { error: 'Insufficient credits for allocation increase' },
            { status: 400 }
          );
        }

        // Deduct additional credits and log transaction in parallel
        const [deductResult, transactionResult] = await Promise.all([
          (supabase as any)
            .from('profiles')
            .update({ credits: (profile as any).credits - creditDifference })
            .eq('id', user.id),
          (supabase as any)
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              amount: -creditDifference,
              reason: 'campaign_allocation_increase',
              ref_table: 'campaigns',
              ref_id: campaignId
            })
        ]);

        if (deductResult.error) {
          console.error('Error deducting credits:', deductResult.error);
          return NextResponse.json(
            { error: 'Failed to allocate credits' },
            { status: 500 }
          );
        }

        if (transactionResult.error) {
          console.error('Error logging transaction:', transactionResult.error);
        }
      }
      // If decreasing allocation, return credits to user
      else if (creditDifference < 0 && profile) {
        const [addResult, transactionResult] = await Promise.all([
          (supabase as any)
            .from('profiles')
            .update({
              credits: (profile as any).credits + Math.abs(creditDifference)
            })
            .eq('id', user.id),
          (supabase as any)
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              amount: Math.abs(creditDifference),
              reason: 'campaign_allocation_decrease',
              ref_table: 'campaigns',
              ref_id: campaignId
            })
        ]);

        if (addResult.error) {
          console.error('Error adding credits back:', addResult.error);
          return NextResponse.json(
            { error: 'Failed to return credits' },
            { status: 500 }
          );
        }

        if (transactionResult.error) {
          console.error('Error logging transaction:', transactionResult.error);
        }
      }
    }

    // Check if campaign should be marked as completed (only if credits_allocated changed)
    if (credits_allocated !== undefined) {
      const { data: currentCampaign } = await supabase
        .from('campaigns')
        .select('credits_spent')
        .eq('id', campaignId)
        .single();

      if (
        currentCampaign &&
        credits_allocated <= (currentCampaign as any).credits_spent
      ) {
        updateData.status = 'completed';
      }
    }

    // Update campaign (RLS will verify ownership)
    const { data: updatedCampaign, error: updateError } = await (
      supabase as any
    )
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error updating campaign:', updateError);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: updatedCampaign,
      message: 'Campaign updated successfully'
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
// DELETE /api/campaigns/[id] - Delete campaign
// ============================================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: campaignId } = await params;

    // Get campaign details before deletion to return credits
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('credits_allocated, credits_spent, title')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate credits to return (only unused credits: allocated - spent)
    const creditsAllocated = (campaign as any).credits_allocated;
    const creditsSpent = (campaign as any).credits_spent;
    const creditsToReturn = Math.max(0, creditsAllocated - creditsSpent);

    console.log(
      `Campaign deletion - Credits allocated: ${creditsAllocated}, Credits spent: ${creditsSpent}, Credits to return: ${creditsToReturn}`
    );

    // Hard delete - actually remove the campaign from database
    const { data: deletedCampaign, error: deleteError } = await (
      supabase as any
    )
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('user_id', user.id) // Ensure user can only delete their own campaigns
      .select()
      .single();

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error deleting campaign:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    // Return only unused credits to user (allocated - spent, not all allocated credits)
    if (creditsToReturn > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { error: addError } = await (supabase as any)
          .from('profiles')
          .update({ credits: (profile as any).credits + creditsToReturn })
          .eq('id', user.id);

        if (addError) {
          console.error('Error returning credits:', addError);
          // Don't fail the request, just log the error
        } else {
          // Log credit transaction for returned unused credits
          const { error: transactionError } = await (supabase as any)
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              amount: creditsToReturn,
              reason: `campaign_deletion_return_${creditsAllocated}_allocated_${creditsSpent}_spent`,
              ref_table: 'campaigns',
              ref_id: campaignId
            });

          if (transactionError) {
            console.error('Error logging transaction:', transactionError);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Campaign deleted successfully',
      campaign: deletedCampaign,
      creditsReturned: creditsToReturn
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
