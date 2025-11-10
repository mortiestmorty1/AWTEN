-- ============================================================================
-- QUICK FIX: Add customers table for Stripe integration
-- ============================================================================

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  -- Primary key references Supabase auth.users
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe customer ID
  stripe_customer_id text UNIQUE,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS customers_select_self ON public.customers;
DROP POLICY IF EXISTS customers_update_self ON public.customers;
DROP POLICY IF EXISTS customers_insert_server ON public.customers;
DROP POLICY IF EXISTS customers_delete_deny ON public.customers;

-- Create policies
CREATE POLICY customers_select_self ON public.customers
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY customers_update_self ON public.customers
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY customers_insert_server ON public.customers
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO service_role;

-- Success message
SELECT '✅ Customers table created and configured for Stripe integration!' as message;
