-- P0: Lock premium/profile fields and usage_tracking from client tampering.

-- Helper: true for service_role JWT or superuser connections (webhooks, admin).
CREATE OR REPLACE FUNCTION public.is_service_role_request()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(auth.role(), '') = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin');
$$;

-- profiles: reject client changes to billing/geo fields (INSERT + UPDATE).
CREATE OR REPLACE FUNCTION public.profiles_guard_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role_request() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.subscription_status := 'free';
    NEW.is_ethiopia_free := false;
    NEW.signup_country := NULL;
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Cannot update subscription_status';
  END IF;
  IF NEW.is_ethiopia_free IS DISTINCT FROM OLD.is_ethiopia_free THEN
    RAISE EXCEPTION 'Cannot update is_ethiopia_free';
  END IF;
  IF NEW.signup_country IS DISTINCT FROM OLD.signup_country THEN
    RAISE EXCEPTION 'Cannot update signup_country';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Cannot update email';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Cannot update created_at';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_protected_columns ON public.profiles;
CREATE TRIGGER profiles_guard_protected_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_guard_protected_columns();

-- profiles UPDATE policy unchanged (trigger enforces column restrictions).
-- usage_tracking: users may read own row only; writes are service_role / SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "usage_insert_own" ON public.usage_tracking;
DROP POLICY IF EXISTS "usage_update_own" ON public.usage_tracking;

-- increment_usage: only own user_id unless service_role; upsert + rolling 24h window.
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_service_role_request() THEN
    RAISE EXCEPTION 'Cannot increment usage for another user';
  END IF;

  INSERT INTO public.usage_tracking (user_id, generation_count, first_story_at, last_generated_at)
  VALUES (p_user_id, 1, now(), now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    generation_count = CASE
      WHEN usage_tracking.first_story_at IS NULL
        OR now() > usage_tracking.first_story_at + interval '24 hours'
      THEN 1
      ELSE usage_tracking.generation_count + 1
    END,
    first_story_at = CASE
      WHEN usage_tracking.first_story_at IS NULL
        OR now() > usage_tracking.first_story_at + interval '24 hours'
      THEN now()
      ELSE usage_tracking.first_story_at
    END,
    last_generated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;
