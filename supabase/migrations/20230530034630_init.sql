/** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb
);
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id,new.email,new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Stripe customer IDs.
*/
create table customers (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  -- The user's customer ID in Stripe. User must not be able to update this.
  stripe_customer_id text
);
alter table customers enable row level security;
-- No policies as this is a private table that the user must not have access to.

/** 
* PRODUCTS
* Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create table products (
  -- Product ID from Stripe, e.g. prod_1234.
  id text primary key,
  -- Whether the product is currently available for purchase.
  active boolean,
  -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
  name text,
  -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
  description text,
  -- A URL of the product image in Stripe, meant to be displayable to the customer.
  image text,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access." on products for select using (true);

/**
* PRICES
* Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table prices (
  -- Price ID from Stripe, e.g. price_1234.
  id text primary key,
  -- The ID of the prduct that this price belongs to.
  product_id text references products, 
  -- Whether the price can be used for new purchases.
  active boolean,
  -- A brief description of the price.
  description text,
  -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
  unit_amount bigint,
  -- Three-letter ISO currency code, in lowercase.
  currency text check (char_length(currency) = 3),
  -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
  type pricing_type,
  -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
  interval pricing_plan_interval,
  -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
  interval_count integer,
  -- Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
  trial_period_days integer,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);
alter table prices enable row level security;
create policy "Allow public read-only access." on prices for select using (true);

/**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
create table subscriptions (
  -- Subscription ID from Stripe, e.g. sub_1234.
  id text primary key,
  user_id uuid references auth.users not null,
  -- The status of the subscription object, one of subscription_status type above.
  status subscription_status,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb,
  -- ID of the price that created this subscription.
  price_id text references prices,
  -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
  quantity integer,
  -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
  cancel_at_period_end boolean,
  -- Time at which the subscription was created.
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Start of the current period that the subscription has been invoiced for.
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  -- If the subscription has ended, the timestamp of the date the subscription ended.
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  -- A date in the future at which the subscription will automatically get canceled.
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the beginning of that trial.
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the end of that trial.
  trial_end timestamp with time zone default timezone('utc'::text, now())
);
alter table subscriptions enable row level security;
create policy "Can only view own subs data." on subscriptions for select using (auth.uid() = user_id);

-- ============================================================================
-- AWTEN SPECIFIC TABLES
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
DO $$ 
BEGIN
  -- Create user_role enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('free', 'premium', 'admin');
  END IF;
END $$;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Purpose: User profiles with roles, credits, and permissions
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key references Supabase auth.users
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User identification
  username text UNIQUE,
  country text,
  
  -- User role determines permissions and features
  role user_role DEFAULT 'free'::user_role NOT NULL,
  
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
-- CREDIT TRANSACTIONS TABLE
-- ============================================================================
-- Purpose: Immutable audit ledger for all credit movements
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
-- CAMPAIGNS TABLE
-- ============================================================================
-- Purpose: User-created traffic campaigns with targeting options and budget
CREATE TABLE IF NOT EXISTS public.campaigns (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign owner (user or model managed by agency)
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
-- VISITS TABLE
-- ============================================================================
-- Purpose: Records each visit to a campaign URL with validation status
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

-- Partial unique index to prevent duplicate credited visits
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique_valid 
  ON public.visits(campaign_id, visitor_id, ip_address) 
  WHERE is_valid = true;

-- ============================================================================
-- FRAUD LOGS TABLE
-- ============================================================================
-- Purpose: Audit trail for visits flagged as fraudulent or suspicious
CREATE TABLE IF NOT EXISTS public.fraud_logs (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to flagged visit
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  
  -- Fraud detection details
  reason text NOT NULL,
  resolved boolean DEFAULT false NOT NULL,
  
  -- Timestamp
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for fraud_logs
CREATE INDEX IF NOT EXISTS idx_fraud_logs_visit_id ON public.fraud_logs(visit_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_created_at ON public.fraud_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_resolved ON public.fraud_logs(resolved);

-- ============================================================================
-- PLAN GRANTS TABLE
-- ============================================================================
-- Purpose: Track bonus credits granted to users based on subscription plans
CREATE TABLE IF NOT EXISTS public.plan_grants (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User receiving grant
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Grant details
  plan text NOT NULL,
  credits int NOT NULL CHECK (credits > 0),
  source text,
  
  -- Timestamp
  granted_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for plan_grants
CREATE INDEX IF NOT EXISTS idx_plan_grants_user_id ON public.plan_grants(user_id, granted_at DESC);

-- ============================================================================
-- TRIGGERS
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
    'free'::user_role,
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

-- Trigger Function: update_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Trigger Function: update_campaigns_updated_at
CREATE OR REPLACE FUNCTION public.update_campaigns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaigns_updated_at();

-- Trigger Function: update_visits_updated_at
CREATE OR REPLACE FUNCTION public.update_visits_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_visits_updated_at ON public.visits;
CREATE TRIGGER trigger_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_visits_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RLS: profiles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: No direct INSERT (only via trigger)
CREATE POLICY profiles_insert_deny ON public.profiles
  FOR INSERT
  WITH CHECK (false);

-- Policy: No DELETE for end users
CREATE POLICY profiles_delete_deny ON public.profiles
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- RLS: credit_transactions (immutable ledger)
-- ----------------------------------------------------------------------------
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY credit_transactions_select_self ON public.credit_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: INSERT only via server (service_role)
CREATE POLICY credit_transactions_insert_server ON public.credit_transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: No UPDATE/DELETE
CREATE POLICY credit_transactions_update_deny ON public.credit_transactions
  FOR UPDATE
  USING (false);

CREATE POLICY credit_transactions_delete_deny ON public.credit_transactions
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- RLS: campaigns
-- ----------------------------------------------------------------------------
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own campaigns
CREATE POLICY campaigns_select_self ON public.campaigns
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own campaigns
CREATE POLICY campaigns_insert_self ON public.campaigns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own campaigns
CREATE POLICY campaigns_update_self ON public.campaigns
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own campaigns
CREATE POLICY campaigns_delete_self ON public.campaigns
  FOR DELETE
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- RLS: visits
-- ----------------------------------------------------------------------------
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view visits to their campaigns
CREATE POLICY visits_select_campaign_owner ON public.visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = visits.campaign_id
        AND c.user_id = auth.uid()
    )
  );

-- Policy: Users can view their own visits
CREATE POLICY visits_select_visitor ON public.visits
  FOR SELECT
  USING (visitor_id = auth.uid());

-- Policy: INSERT/UPDATE only via server (service_role)
CREATE POLICY visits_insert_server ON public.visits
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY visits_update_server ON public.visits
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: No DELETE
CREATE POLICY visits_delete_deny ON public.visits
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- RLS: fraud_logs
-- ----------------------------------------------------------------------------
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Campaign owners can view fraud logs for their campaigns
CREATE POLICY fraud_logs_select_campaign_owner ON public.fraud_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.visits v
      JOIN public.campaigns c ON c.id = v.campaign_id
      WHERE v.id = fraud_logs.visit_id
        AND c.user_id = auth.uid()
    )
  );

-- Policy: Visitors can view fraud logs for their visits
CREATE POLICY fraud_logs_select_visitor ON public.fraud_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.id = fraud_logs.visit_id
        AND v.visitor_id = auth.uid()
    )
  );

-- Policy: INSERT/UPDATE only via server
CREATE POLICY fraud_logs_insert_server ON public.fraud_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY fraud_logs_update_server ON public.fraud_logs
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: No DELETE
CREATE POLICY fraud_logs_delete_deny ON public.fraud_logs
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- RLS: plan_grants
-- ----------------------------------------------------------------------------
ALTER TABLE public.plan_grants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own grants
CREATE POLICY plan_grants_select_self ON public.plan_grants
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: INSERT only via server
CREATE POLICY plan_grants_insert_server ON public.plan_grants
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: No UPDATE/DELETE
CREATE POLICY plan_grants_update_deny ON public.plan_grants
  FOR UPDATE
  USING (false);

CREATE POLICY plan_grants_delete_deny ON public.plan_grants
  FOR DELETE
  USING (false);

-- ============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS
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

-- Function: fn_mark_visit_valid
CREATE OR REPLACE FUNCTION public.fn_mark_visit_valid(
  p_visit_id uuid,
  p_visit_duration int,
  p_credits_earned int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Guard: Only service_role can execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can validate visits';
  END IF;
  
  -- Update visit
  UPDATE public.visits
  SET 
    is_valid = true,
    visit_duration = p_visit_duration,
    credits_earned = p_credits_earned,
    end_time = now()
  WHERE id = p_visit_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'visit not found: %', p_visit_id;
  END IF;
END;
$$;

-- Function: fn_log_fraud
CREATE OR REPLACE FUNCTION public.fn_log_fraud(
  p_visit_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Guard: Only service_role can execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can log fraud';
  END IF;
  
  -- Insert fraud log
  INSERT INTO public.fraud_logs (visit_id, reason, resolved)
  VALUES (p_visit_id, p_reason, false);
END;
$$;


-- Function: fn_exchange_reward
CREATE OR REPLACE FUNCTION public.fn_exchange_reward(
  p_visitor_id uuid,
  p_owner_id uuid,
  p_campaign_id uuid,
  p_visit_id uuid,
  p_amount int,
  p_visit_duration int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_credits_allocated int;
  v_credits_spent int;
BEGIN
  -- Guard: Only service_role can execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can process rewards';
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'reward amount must be positive';
  END IF;
  
  -- Check campaign budget
  SELECT credits_allocated, credits_spent
  INTO v_credits_allocated, v_credits_spent
  FROM public.campaigns
  WHERE id = p_campaign_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'campaign not found: %', p_campaign_id;
  END IF;
  
  IF (v_credits_spent + p_amount) > v_credits_allocated THEN
    RAISE EXCEPTION 'campaign budget exceeded: allocated %, spent %, attempting %',
      v_credits_allocated, v_credits_spent, p_amount;
  END IF;
  
  -- Mark visit as valid
  PERFORM public.fn_mark_visit_valid(p_visit_id, p_visit_duration, p_amount);
  
  -- Award credits to visitor
  PERFORM public.fn_award_credits(
    p_visitor_id,
    p_amount,
    'visit_validated',
    'visits',
    p_visit_id,
    jsonb_build_object('campaign_id', p_campaign_id, 'visit_duration', p_visit_duration)
  );
  
  -- Spend credits from campaign owner
  PERFORM public.fn_spend_credits(
    p_owner_id,
    p_amount,
    'campaign_spend',
    'campaigns',
    p_campaign_id,
    jsonb_build_object('visit_id', p_visit_id, 'visitor_id', p_visitor_id)
  );
  
  -- Update campaign spent credits
  UPDATE public.campaigns
  SET credits_spent = credits_spent + p_amount
  WHERE id = p_campaign_id;
  
  -- Update visitor's total_visits stat
  UPDATE public.profiles
  SET total_visits = total_visits + 1
  WHERE id = p_visitor_id;
END;
$$;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, prices, public.campaigns, public.visits;