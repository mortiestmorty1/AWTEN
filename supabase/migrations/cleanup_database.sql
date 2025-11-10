-- ============================================================================
-- AWTEN Database Cleanup Script
-- ============================================================================
-- Purpose: Clean the database by removing all tables, functions, and policies
-- WARNING: This will delete ALL data in the database!
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP ALL POLICIES
-- ============================================================================

-- Drop all RLS policies
DROP POLICY IF EXISTS "Can view own user data." ON users;
DROP POLICY IF EXISTS "Can update own user data." ON users;
DROP POLICY IF EXISTS "Can only view own subs data." ON subscriptions;
DROP POLICY IF EXISTS "Allow public read-only access." ON products;
DROP POLICY IF EXISTS "Allow public read-only access." ON prices;

-- Drop AWTEN-specific policies
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_select_agency_models ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_deny ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_deny ON public.profiles;

DROP POLICY IF EXISTS credit_transactions_select_self ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_insert_server ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_update_deny ON public.credit_transactions;
DROP POLICY IF EXISTS credit_transactions_delete_deny ON public.credit_transactions;

DROP POLICY IF EXISTS campaigns_select_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_select_agency_models ON public.campaigns;
DROP POLICY IF EXISTS campaigns_insert_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_update_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_update_agency_models ON public.campaigns;
DROP POLICY IF EXISTS campaigns_delete_self ON public.campaigns;
DROP POLICY IF EXISTS campaigns_delete_agency_models ON public.campaigns;

DROP POLICY IF EXISTS visits_select_campaign_owner ON public.visits;
DROP POLICY IF EXISTS visits_select_visitor ON public.visits;
DROP POLICY IF EXISTS visits_select_agency_models ON public.visits;
DROP POLICY IF EXISTS visits_insert_server ON public.visits;
DROP POLICY IF EXISTS visits_update_server ON public.visits;
DROP POLICY IF EXISTS visits_delete_deny ON public.visits;

DROP POLICY IF EXISTS fraud_logs_select_campaign_owner ON public.fraud_logs;
DROP POLICY IF EXISTS fraud_logs_select_visitor ON public.fraud_logs;
DROP POLICY IF EXISTS fraud_logs_select_agency ON public.fraud_logs;
DROP POLICY IF EXISTS fraud_logs_insert_server ON public.fraud_logs;
DROP POLICY IF EXISTS fraud_logs_update_server ON public.fraud_logs;
DROP POLICY IF EXISTS fraud_logs_delete_deny ON public.fraud_logs;

DROP POLICY IF EXISTS plan_grants_select_self ON public.plan_grants;
DROP POLICY IF EXISTS plan_grants_insert_server ON public.plan_grants;
DROP POLICY IF EXISTS plan_grants_update_deny ON public.plan_grants;
DROP POLICY IF EXISTS plan_grants_delete_deny ON public.plan_grants;

-- ============================================================================
-- SECTION 2: DROP ALL TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON public.campaigns;

-- ============================================================================
-- SECTION 3: DROP ALL FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_profile();
DROP FUNCTION IF EXISTS public.update_profiles_updated_at();
DROP FUNCTION IF EXISTS public.update_campaigns_updated_at();
DROP FUNCTION IF EXISTS public.fn_award_credits(uuid, int, text, text, uuid);
DROP FUNCTION IF EXISTS public.fn_spend_credits(uuid, int, text, text, uuid);
DROP FUNCTION IF EXISTS public.fn_mark_visit_valid(uuid, int);
DROP FUNCTION IF EXISTS public.fn_log_fraud(uuid, text);
DROP FUNCTION IF EXISTS public.fn_agency_assign_model(uuid, uuid);
DROP FUNCTION IF EXISTS public.fn_exchange_reward(uuid, uuid, uuid, uuid, int, int);

-- ============================================================================
-- SECTION 4: DROP ALL TABLES
-- ============================================================================

-- Drop AWTEN-specific tables
DROP TABLE IF EXISTS public.plan_grants CASCADE;
DROP TABLE IF EXISTS public.fraud_logs CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop Stripe-related tables
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.prices CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- SECTION 5: DROP ALL ENUMS
-- ============================================================================

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.pricing_type CASCADE;
DROP TYPE IF EXISTS public.pricing_plan_interval CASCADE;

-- ============================================================================
-- SECTION 6: DROP ALL PUBLICATIONS
-- ============================================================================

DROP PUBLICATION IF EXISTS supabase_realtime;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Database cleanup completed successfully!';
  RAISE NOTICE '✓ All tables, functions, policies, and triggers removed';
  RAISE NOTICE '✓ Database is now clean and ready for fresh schema';
END $$;
