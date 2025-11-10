-- ============================================================================
-- AWTEN Complete Database Setup
-- ============================================================================
-- This script ensures the database is properly set up with all required tables,
-- policies, and functions for the AWTEN traffic exchange platform.
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENSURE PROFILES TABLE EXISTS AND IS ACCESSIBLE
-- ============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key references Supabase auth.users
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User identification
  username text UNIQUE,
  country text,
  
  -- User role determines permissions and features
  role text DEFAULT 'free' NOT NULL CHECK (role IN ('free', 'premium', 'admin')),
  
  -- Credit system for traffic exchange
  credits int DEFAULT 0 NOT NULL CHECK (credits >= 0),
  
  -- Statistics tracking
  total_visits int DEFAULT 0 NOT NULL CHECK (total_visits >= 0),
  
  -- Additional fields for enhanced functionality
  credit_multiplier decimal(3,2) DEFAULT 1.0 NOT NULL CHECK (credit_multiplier >= 0.1 AND credit_multiplier <= 5.0),
  campaign_limit int DEFAULT 3 NOT NULL CHECK (campaign_limit >= 0),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON public.profiles(credits DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================================================
-- SECTION 2: ENSURE CAMPAIGNS TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign owner
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Campaign details
  title text NOT NULL,
  url text NOT NULL,
  description text,
  
  -- Targeting options
  country_target text,
  device_target text CHECK (device_target IN ('desktop', 'tablet', 'mobile')),
  
  -- Credit budget
  credits_allocated int DEFAULT 0 NOT NULL CHECK (credits_allocated >= 0),
  credits_spent int DEFAULT 0 NOT NULL CHECK (credits_spent >= 0),
  
  -- Campaign status
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'deleted')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT credits_spent_not_exceed_allocated CHECK (credits_spent <= credits_allocated)
);

-- Create indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- ============================================================================
-- SECTION 3: ENSURE VISITS TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.visits (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign and visitor references
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Visit details
  ip_address inet,
  user_agent text,
  visit_duration int DEFAULT 0 CHECK (visit_duration >= 0),
  
  -- Validation and fraud detection
  is_valid boolean DEFAULT false NOT NULL,
  credits_earned int DEFAULT 0 NOT NULL CHECK (credits_earned >= 0),
  fraud_score decimal(3,2) DEFAULT 0.0 CHECK (fraud_score >= 0.0 AND fraud_score <= 1.0),
  
  -- Timing
  start_time timestamptz,
  end_time timestamptz,
  
  -- Timestamp
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for visits
CREATE INDEX IF NOT EXISTS idx_visits_campaign_id ON public.visits(campaign_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON public.visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_is_valid ON public.visits(is_valid);

-- ============================================================================
-- SECTION 4: ENSURE CUSTOMERS TABLE EXISTS (for Stripe integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  -- Primary key references Supabase auth.users
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe customer ID
  stripe_customer_id text UNIQUE,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- SECTION 5: ENSURE CREDIT TRANSACTIONS TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User involved in transaction
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction amount (positive = award, negative = spend)
  amount int NOT NULL CHECK (amount <> 0),
  
  -- Human-readable reason for transaction
  reason text,
  
  -- Optional reference to related table/record
  ref_table text,
  ref_id uuid,
  
  -- Additional metadata for enhanced tracking
  metadata jsonb,
  
  -- Timestamp (immutable)
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- ============================================================================
-- SECTION 5: SETUP RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_deny ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_deny ON public.profiles;

DROP POLICY IF EXISTS campaigns_select_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_insert_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_update_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_delete_self ON public.campaigns;

DROP POLICY IF EXISTS visits_select_campaign_owner ON public.visits;
DROP POLICY IF EXISTS visits_select_visitor ON public.visits;
DROP POLICY IF EXISTS visits_insert_server ON public.visits;
DROP POLICY IF EXISTS visits_update_server ON public.visits;
DROP POLICY IF EXISTS visits_delete_deny ON public.visits;

DROP POLICY IF EXISTS customers_select_self ON public.customers;
DROP POLICY IF EXISTS customers_update_self ON public.customers;
DROP POLICY IF EXISTS customers_insert_server ON public.customers;
DROP POLICY IF EXISTS customers_delete_deny ON public.customers;

DROP POLICY IF EXISTS credit_transactions_select_self ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_insert_server ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_update_deny ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_delete_deny ON public.credit_transactions;

-- Create new policies
-- Profiles policies
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Campaigns policies
CREATE POLICY campaigns_select_self ON public.campaigns
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY campaigns_insert_self ON public.campaigns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY campaigns_update_self ON public.campaigns
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY campaigns_delete_self ON public.campaigns
  FOR DELETE
  USING (user_id = auth.uid());

-- Visits policies
CREATE POLICY visits_select_campaign_owner ON public.visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = visits.campaign_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY visits_select_visitor ON public.visits
  FOR SELECT
  USING (visitor_id = auth.uid());

CREATE POLICY visits_insert_server ON public.visits
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY visits_update_server ON public.visits
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Customers policies
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

-- Credit transactions policies
CREATE POLICY credit_transactions_select_self ON public.credit_transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY credit_transactions_insert_server ON public.credit_transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- SECTION 6: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: fn_award_credits
CREATE OR REPLACE FUNCTION public.fn_award_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text DEFAULT 'credit_award',
  p_ref_table text DEFAULT NULL,
  p_ref_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Guard: Only service_role can execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can award credits';
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  
  -- Update profile credits atomically
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found: %', p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, ref_table, ref_id, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_ref_table, p_ref_id, p_metadata);
END;
$$;

-- Function: fn_spend_credits
CREATE OR REPLACE FUNCTION public.fn_spend_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text DEFAULT 'credit_spend',
  p_ref_table text DEFAULT NULL,
  p_ref_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_credits int;
BEGIN
  -- Guard: Only service_role can execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can spend credits';
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  
  -- Check current credits
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found: %', p_user_id;
  END IF;
  
  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'insufficient credits: has %, needs %', v_current_credits, p_amount;
  END IF;
  
  -- Update profile credits atomically
  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id;
  
  -- Log transaction (negative amount for spend)
  INSERT INTO public.credit_transactions (user_id, amount, reason, ref_table, ref_id, metadata)
  VALUES (p_user_id, -p_amount, p_reason, p_ref_table, p_ref_id, p_metadata);
END;
$$;

-- ============================================================================
-- SECTION 7: CREATE PROFILE TRIGGER
-- ============================================================================

-- Trigger Function: handle_new_profile
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'free',
    10  -- Start with 10 free credits
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- ============================================================================
-- SECTION 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users for all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO authenticated;

-- Grant permissions to service_role for admin operations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ AWTEN Database Setup Complete!';
  RAISE NOTICE '✅ All tables created with proper structure';
  RAISE NOTICE '✅ RLS policies configured for security';
  RAISE NOTICE '✅ Helper functions created for credit management';
  RAISE NOTICE '✅ Profile creation trigger configured';
  RAISE NOTICE '✅ Stripe customers table added for payments';
  RAISE NOTICE '🚀 Database is ready for the AWTEN application!';
END $$;
