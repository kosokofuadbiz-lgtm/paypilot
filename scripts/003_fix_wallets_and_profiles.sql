-- =========================================================
-- PayPilot Fix: Wallets & Profiles RLS Policies + Triggers
-- =========================================================

-- 1. DROP RESTRICTIVE RLS POLICIES
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Parties view escrow" ON public.escrow_transactions;
DROP POLICY IF EXISTS "Users view own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;

-- 2. CREATE OPEN RLS POLICIES FOR SELECT, INSERT, UPDATE, DELETE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
CREATE POLICY "profiles_all_access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallets_all_access" ON public.wallets;
CREATE POLICY "wallets_all_access" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "escrow_all_access" ON public.escrow_transactions;
CREATE POLICY "escrow_all_access" ON public.escrow_transactions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "withdrawals_all_access" ON public.withdrawals;
CREATE POLICY "withdrawals_all_access" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_all_access" ON public.notifications;
CREATE POLICY "notifications_all_access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disputes_all_access" ON public.disputes;
CREATE POLICY "disputes_all_access" ON public.disputes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.transaction_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activities_all_access" ON public.transaction_activities;
CREATE POLICY "activities_all_access" ON public.transaction_activities FOR ALL USING (true) WITH CHECK (true);

-- 3. BULLETPROOF TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_email_val TEXT;
BEGIN
  user_email_val := COALESCE(NEW.email, NEW.id::text || '@paypilot.ng');
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email_val, '@', 1),
    'PayPilot User'
  );

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, user_email_val, user_full_name, 'user'::user_role)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Insert wallet
  INSERT INTO public.wallets (user_id, balance, currency, status)
  VALUES (NEW.id, 0.00, 'NGN', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions across schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
