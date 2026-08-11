'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Lock, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { FundWalletModal } from '@/components/payments/fund-wallet-modal';
import { useAuth } from '@/lib/auth-context';

export function WalletCard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [showFundModal, setShowFundModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [heldBalance, setHeldBalance] = useState(0);
  const [paypilotAccNo, setPaypilotAccNo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBalance = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/wallet?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok && data.balance !== undefined) {
        setBalance(Number(data.balance || 0));
        setHeldBalance(Number(data.held_balance || 0));
        // Use the DB-stored account number (set at registration)
        if (data.paypilot_account_number) {
          setPaypilotAccNo(data.paypilot_account_number);
        }
      } else {
        setBalance(0);
        setHeldBalance(0);
      }
    } catch {
      setBalance(0);
      setHeldBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchBalance(user.id);
  }, [user?.id, authLoading]);

  const handleSuccess = () => {
    if (user?.id) {
      fetchBalance(user.id);
    }
    // Small delay then reload to show the updated balance
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <>
      <Card className="relative overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-2xl">
        {/* Subtle background glow circle */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="flex flex-col space-y-4">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <WalletIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-300">Escrow Wallet Balance</h3>
                <p className="text-[11px] text-slate-500">Instant Escrow Funding &amp; Withdrawal</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Shield className="h-3 w-3" />
              <span>Active</span>
            </span>
          </div>

          {/* Balance display */}
          <div className="py-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
              {loading ? (
                <span className="text-slate-500 animate-pulse text-2xl">Loading...</span>
              ) : (
                formatCurrency(balance)
              )}
            </div>

            {/* PayPilot Escrow Account Number */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-medium">PayPilot Escrow Acc No:</span>
              </div>
              <div className="flex items-center space-x-2 font-mono font-bold text-slate-100">
                <span className="tracking-wider text-cyan-300">{paypilotAccNo || '...'}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paypilotAccNo);
                    alert('Account number copied!');
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                  title="Copy PayPilot Account Number"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {heldBalance > 0 && (
              <div className="mt-2 flex items-center space-x-1.5 text-xs text-amber-400">
                <Lock className="h-3.5 w-3.5" />
                <span>{formatCurrency(heldBalance)} locked in pending withdrawal / dispute hold</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="gradient"
              onClick={() => setShowFundModal(true)}
              className="w-full flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Fund Wallet</span>
            </Button>

            <Link href="/withdrawals" className="w-full">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 text-xs sm:text-sm border-slate-700 bg-slate-900/80 hover:bg-slate-800"
              >
                <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                <span>Withdraw</span>
              </Button>
            </Link>
          </div>

        </div>
      </Card>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        open={showFundModal}
        onOpenChange={setShowFundModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
