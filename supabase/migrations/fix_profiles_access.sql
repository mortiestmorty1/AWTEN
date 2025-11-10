-- ============================================================================
-- TEMPORARY FIX: Allow profiles access
-- ============================================================================
-- This is a temporary fix to allow the app to work while the full schema is applied
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_deny ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_deny ON public.profiles;

-- Create temporary permissive policies
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

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Profiles access fixed!';
  RAISE NOTICE '✓ Users can now access their own profiles';
  RAISE NOTICE '✓ RLS policies are properly configured';
END $$;
