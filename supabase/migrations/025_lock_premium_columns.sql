-- Lock premium/admin profile columns: authenticated users cannot UPDATE them (service_role can).

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Column-level privileges (only revoke/grant columns that exist on public.profiles).
DO $$
DECLARE
  protected_cols constant text[] := ARRAY[
    'subscription_status',
    'subscription_tier',
    'stripe_customer_id',
    'stripe_subscription_id',
    'is_premium',
    'premium_until',
    'role',
    'is_ethiopia_free',
    'signup_country',
    'email',
    'created_at'
  ];
  existing_cols text;
BEGIN
  SELECT string_agg(format('%I', column_name), ', ' ORDER BY column_name)
  INTO existing_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (protected_cols);

  IF existing_cols IS NULL OR existing_cols = '' THEN
    RAISE NOTICE '025: no protected profile columns found to lock';
    RETURN;
  END IF;

  EXECUTE format(
    'REVOKE UPDATE (%s) ON public.profiles FROM authenticated, anon',
    existing_cols
  );
  EXECUTE format(
    'GRANT UPDATE (%s) ON public.profiles TO service_role',
    existing_cols
  );

  RAISE NOTICE '025: locked profile columns: %', existing_cols;
END;
$$;
