'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { ArrowUpRight, AlertCircle, Building, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency, formatDate, getWithdrawalStatusBadge } from '@/lib/utils';

export default function WithdrawalsPage() {
  const currentUser = mockStore.getCurrentUser();
  const wallet = mockStore.getWallet(currentUser.id);
  const withdrawals = mockStore.getWithdrawals(currentUser.id);

  const hasBankDetails = Boolean(
    currentUser.real_bank_name && 
    currentUser.real_account_number && 
    currentUser.real_account_name
  );

  const [amount, setAmount] = useState('20000');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const num = parseFloat(amount);
    if (isNaN(num) || num < 1000) {
      setErrorMsg('Minimum withdrawal amount is ₦1,000.');
      return;
    }

    if (wallet.balance < num) {
      setErrorMsg(`Insufficient wallet balance. Available: ${formatCurrency(wallet.balance)}.`);
      return;
    }

    setSubmitting(true);

    try {
      mockStore.requestWithdrawal(currentUser.id, num);
      setSuccessMsg(`Withdrawal request for ${formatCurrency(num)} submitted successfully!`);
      setAmount('20000');
    } catch (err: any) {
      setErrorMsg(err.message || 'Withdrawal request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ArrowUpRight className="h-6 w-6 text-emerald-400" />
              <span>Wallet Withdrawals</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Transfer available wallet funds directly to your verified bank account</p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Available to Withdraw</span>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(wallet.balance)}</p>
          </div>
        </div>

        {/* GATED CHECK: If bank details are missing */}
        {!hasBankDetails ? (
          <Card className="border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Bank Details Required</h3>
              <p className="text-xs text-amber-300/80 max-w-md mx-auto mt-1">
                You must configure your settlement bank account number and bank name in Profile settings before requesting withdrawals.
              </p>
            </div>
            <Link href="/profile" className="inline-block">
              <Button variant="gradient" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Add Bank Account Details</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          /* Withdrawal Request Form */
          <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-800 mb-4">
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-400" />
                <span>Destination Bank Account</span>
              </CardTitle>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
                <span>Bank: <strong className="text-slate-100">{currentUser.real_bank_name}</strong></span>
                <span>Account: <strong className="text-slate-100">{currentUser.real_account_number} ({currentUser.real_account_name})</strong></span>
              </div>
            </CardHeader>

            {successMsg && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Withdrawal Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₦</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 text-base font-semibold text-emerald-300"
                    min="1000"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Minimum withdrawal: ₦1,000. Payouts are processed within 24 hours.</p>
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="lg"
                className="w-full flex items-center justify-center space-x-2"
                disabled={submitting}
              >
                <span>Request Payout Transfer</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        )}

        {/* Withdrawal Requests Audit Log */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <CardHeader className="px-0 pt-0 pb-3 border-b border-slate-800">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span>Withdrawal Request History</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No past withdrawal requests recorded.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {withdrawals.map((w) => {
                  const statusBadge = getWithdrawalStatusBadge(w.status);

                  return (
                    <div key={w.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-1 gap-2 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100 text-sm">{formatCurrency(w.amount)}</span>
                          <Badge variant="outline" className={`text-[10px] ${statusBadge.variant}`}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Destination: {w.bank_name} ({w.account_number}) • {formatDate(w.created_at)}
                        </p>
                        {w.rejection_reason && (
                          <p className="text-red-400 text-[11px] mt-1">Rejection Reason: {w.rejection_reason}</p>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500">Ref #{w.id}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
