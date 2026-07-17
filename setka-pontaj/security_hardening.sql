-- SETKA Pontaj security hardening migration
-- Run once in the Supabase SQL Editor while signed in as the project owner.
-- The preflight check deliberately aborts if no approved owner exists.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE approved IS TRUE) THEN
    RAISE EXCEPTION
      'Security migration stopped: approve at least one owner profile before running it.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND approved IS TRUE
  );
$$;

REVOKE ALL ON FUNCTION public.is_approved_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved_user() TO authenticated;

-- Remove every pre-existing policy on the app tables. This prevents an old,
-- permissive policy from remaining active alongside the new restrictions.
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'profiles', 'referees', 'rate_categories', 'global_rates',
        'monthly_entries', 'international_bonuses', 'locked_periods',
        'saved_acts'
      ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      p.policyname, p.schemaname, p.tablename
    );
  END LOOP;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'referees', 'rate_categories', 'global_rates',
    'monthly_entries', 'international_bonuses', 'locked_periods',
    'saved_acts'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', table_name);
    END IF;
  END LOOP;
END;
$$;

CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() AND approved IS TRUE);

-- Tables that the current interface only reads.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['rate_categories', 'global_rates']
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_approved_user())',
        table_name || '_approved_select', table_name
      );
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', table_name);
    END IF;
  END LOOP;
END;
$$;

-- Tables managed through the current interface.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'referees', 'monthly_entries', 'international_bonuses',
    'locked_periods', 'saved_acts'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_approved_user()) WITH CHECK (public.is_approved_user())',
        table_name || '_approved_all', table_name
      );
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
        table_name
      );
    END IF;
  END LOOP;
END;
$$;

GRANT SELECT ON TABLE public.profiles TO authenticated;

-- PostgreSQL views are security-definer by default. security_invoker makes
-- this view obey the RLS policies of its underlying tables.
ALTER VIEW public.entry_totals SET (security_invoker = true);
REVOKE ALL ON TABLE public.entry_totals FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.entry_totals TO authenticated;

-- Prevent API roles from creating objects in the public schema.
REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;

-- Harden existing SECURITY DEFINER helpers against search_path attacks.
DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

COMMIT;
