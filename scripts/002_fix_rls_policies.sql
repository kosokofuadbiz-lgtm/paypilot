-- =========================================================
-- PayPilot RLS Policy & Database Permissive Access Script
-- =========================================================

-- 1. Enable Full Access Policies on Profiles
DROP POLICY IF EXISTS "Allow public all access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on profiles" 
  ON public.profiles FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 2. Enable Full Access Policies on Wallets
DROP POLICY IF EXISTS "Allow public all access on wallets" ON public.wallets;
DROP POLICY IF EXISTS "Wallets select policy" ON public.wallets;
DROP POLICY IF EXISTS "Wallets update policy" ON public.wallets;

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on wallets" 
  ON public.wallets FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. Enable Full Access Policies on Escrow Transactions
DROP POLICY IF EXISTS "Allow public all access on escrow_transactions" ON public.escrow_transactions;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on escrow_transactions" 
  ON public.escrow_transactions FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 4. Enable Full Access Policies on Transaction Activities
DROP POLICY IF EXISTS "Allow public all access on transaction_activities" ON public.transaction_activities;
ALTER TABLE public.transaction_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on transaction_activities" 
  ON public.transaction_activities FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 5. Enable Full Access Policies on Withdrawals
DROP POLICY IF EXISTS "Allow public all access on withdrawals" ON public.withdrawals;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on withdrawals" 
  ON public.withdrawals FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 6. Enable Full Access Policies on Notifications
DROP POLICY IF EXISTS "Allow public all access on notifications" ON public.notifications;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on notifications" 
  ON public.notifications FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 7. Grant Permissions to Postgres Roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
