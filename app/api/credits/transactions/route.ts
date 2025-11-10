import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

// ============================================================================
// GET /api/credits/transactions - Get user's credit transaction history
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type'); // 'earned' or 'spent'

    // Build query
    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if specified
    if (type === 'earned') {
      query = query.gt('amount', 0);
    } else if (type === 'spent') {
      query = query.lt('amount', 0);
    }

    // Run transaction query and summary query in parallel (summary uses limited data)
    const [{ data: transactions, error, count }, { data: summaryTransactions }] = await Promise.all([
      query,
      // Get summary from recent transactions only (last 1000 for performance)
      supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000)
    ]);

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Calculate summary statistics from limited dataset
    const summary = {
      totalEarned:
        summaryTransactions
          ?.filter((t: any) => t.amount > 0)
          .reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
      totalSpent: Math.abs(
        summaryTransactions
          ?.filter((t: any) => t.amount < 0)
          .reduce((sum: number, t: any) => sum + t.amount, 0) || 0
      ),
      transactionCount: count || 0 // Use count from paginated query
    };

    return NextResponse.json({
      transactions,
      summary,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
