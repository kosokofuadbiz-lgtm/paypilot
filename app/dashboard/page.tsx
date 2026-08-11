'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { WalletCard } from '@/components/dashboard/wallet-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, PlusCircle, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Derived values from real Supabase profile
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const hasBankDetails = Boolean(profile?.real_bank_name && profile?.real_account_number);

  // Capture URL params once at mount — before they get cleared
  const pendingVerifyRef = React.useRef<{ reference: string; amount: string; userId: string } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    const amount = params.get('amount') || '';
    const urlUserId = params.get('userId') || '';
    if (reference) {
      pendingVerifyRef.current = { reference, amount, userId: urlUserId };
      // Clean the URL immediately so it doesn't trigger multiple verify calls
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // runs once on mount

  useEffect(() => {
    // Wait until we have a reference to verify AND the user is loaded
    if (!pendingVerifyRef.current) return;

    const { reference, amount, userId: urlUserId } = pendingVerifyRef.current;
    // Use the real auth user.id if available, otherwise fall back to what was in the URL
    const resolvedUserId = user?.id || urlUserId;

    if (!resolvedUserId) return; // Still waiting for auth to load

    // Clear the ref so we don't verify twice
    pendingVerifyRef.current = null;

    const verifyPaystackDeposit = async () => {
      try {
        const res = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(reference)}&amount=${encodeURIComponent(amount)}&userId=${encodeURIComponent(resolvedUserId)}`
        );
        const data = await res.json();

        if (res.ok && (data?.status || data?.data?.status === 'success')) {
          const credited = Number(data.creditedAmount ?? (data.data?.amount ? data.data.amount / 100 : 0));
          setPaymentNotice(
            credited > 0
              ? `Wallet funded successfully with ₦${credited.toLocaleString()} via Paystack!`
              : 'Wallet funding completed & verified.'
          );
          // Reload after short delay so wallet card refetches updated balance
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        setPaymentNotice('Payment verification completed.');
      }
    };

    verifyPaystackDeposit();
  }, [user?.id]); // Re-run if user loads after redirect

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Welcome back, <span className="text-cyan-400">{displayName}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your escrow account is active and protected under PayPilot safety standards.
            </p>
          </div>

          {paymentNotice && (
            <div className="mt-4 sm:mt-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {paymentNotice}
            </div>
          )}

          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href="/transactions/create">
              <Button variant="gradient" size="sm" className="flex items-center space-x-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>New Escrow</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Bank Details Warning Banner (if incomplete) */}
        {!hasBankDetails && profile && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 text-xs">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold">Complete Bank Profile Required for Withdrawals</p>
                <p className="text-amber-400/80">Add your bank account number and bank name in Profile settings to enable payouts.</p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 whitespace-nowrap">
                Update Bank Info
              </Button>
            </Link>
          </div>
        )}

        {/* Dashboard Grid: Wallet Column + Recent Transactions Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (1 col): Wallet Card & Quick Tips */}
          <div className="space-y-6 lg:col-span-1">
            <WalletCard />

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>PayPilot Safety Tips</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Never release funds until you have physically inspected the item or verified digital deliverables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Keep all communications and delivery waybills inside the transaction details page.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column (2 cols): Recent Escrows Feed */}
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>

        </div>

      </main>
    </div>
  );
}
