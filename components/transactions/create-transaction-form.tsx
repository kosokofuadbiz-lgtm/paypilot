'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Search, AlertCircle, ArrowRight,
  CheckCircle2, Loader2, UserCheck, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { calculateEscrowFee, formatCurrency } from '@/lib/utils';
import { mockStore } from '@/lib/supabase/mock-store';

interface LookupResult {
  found: boolean;
  user_id?: string;
  full_name?: string;
  paypilot_account_number?: string;
  error?: string;
}

export function CreateTransactionForm() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Live wallet balance from Supabase
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Receiver lookup
  const [receiverAccNo, setReceiverAccNo] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transaction fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [inspectionDays, setInspectionDays] = useState('3');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch real wallet balance
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/user/wallet?userId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(data => { if (data.balance !== undefined) setWalletBalance(Number(data.balance || 0)); })
      .catch(() => {})
      .finally(() => setBalanceLoading(false));
  }, [user?.id]);

  const parsedAmount = parseFloat(amount) || 0;
  const fee = calculateEscrowFee(parsedAmount);
  const totalDeduction = parsedAmount + fee;
  const hasSufficientBalance = walletBalance >= totalDeduction;

  // Auto-lookup as user finishes typing a 10-digit number
  const handleAccNoChange = (val: string) => {
    // Only allow digits, max 10
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setReceiverAccNo(cleaned);
    setLookupResult(null);
    setLookupError(null);

    if (lookupTimeout.current) clearTimeout(lookupTimeout.current);
    if (cleaned.length === 10) {
      lookupTimeout.current = setTimeout(() => handleLookup(cleaned), 500);
    }
  };

  const handleLookup = async (accNo?: string) => {
    const target = accNo || receiverAccNo;
    if (!target || target.length !== 10) {
      setLookupError('Enter the full 10-digit PayPilot account number.');
      return;
    }

    // Check if it's the user's own account number
    const myAccNo = profile ? null : null; // Will check via API result
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/user/lookup-account?accountNumber=${encodeURIComponent(target)}`);
      const data: LookupResult = await res.json();

      if (!data.found) {
        setLookupError(data.error || 'No PayPilot account found with this number. Please check and try again.');
        return;
      }

      // Prevent self-transfer
      if (data.user_id === user?.id) {
        setLookupError('You cannot create an escrow transaction with your own account.');
        return;
      }

      setLookupResult(data);
    } catch {
      setLookupError('Network error. Please check your connection and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const clearReceiver = () => {
    setReceiverAccNo('');
    setLookupResult(null);
    setLookupError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title || !description || parsedAmount <= 0) {
      setErrorMsg('Please fill in the transaction title, description, and amount.');
      return;
    }
    if (!lookupResult?.found || !lookupResult.user_id) {
      setErrorMsg('Please verify a valid receiver PayPilot account number first.');
      return;
    }
    if (!hasSufficientBalance) {
      setErrorMsg(`Insufficient wallet balance. You need ${formatCurrency(totalDeduction)} but have ${formatCurrency(walletBalance)}. Please fund your wallet first.`);
      return;
    }
    if (!user?.id) {
      setErrorMsg('You must be logged in to create an escrow.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          amount: parsedAmount,
          buyer_id: user.id,
          seller_id: lookupResult.user_id,
          category,
          inspection_days: parseInt(inspectionDays),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.id) {
        throw new Error(data.error || 'Failed to create escrow transaction.');
      }

      router.push(`/transactions/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create escrow transaction.');
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl border-slate-800 bg-slate-900/80 shadow-2xl p-6 sm:p-8">
      <CardHeader className="px-0 pt-0 pb-6 border-b border-slate-800">
        <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyan-400" />
          <span>New Escrow Transaction</span>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Funds are locked safely in escrow until you verify and confirm receipt of goods or services.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6 pt-6">

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── 1. Receiver PayPilot Account Number Lookup ── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Receiver's PayPilot Account Number <span className="text-cyan-400">*</span>
          </label>
          <p className="text-[11px] text-slate-500">Enter the 10-digit PayPilot account number of the seller/receiver</p>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 9012345678"
                value={receiverAccNo}
                onChange={e => handleAccNoChange(e.target.value)}
                maxLength={10}
                className={`font-mono tracking-widest pr-8 ${
                  lookupResult?.found
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : lookupError
                    ? 'border-red-500/50 bg-red-500/5'
                    : ''
                }`}
              />
              {receiverAccNo && (
                <button
                  type="button"
                  onClick={clearReceiver}
                  className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleLookup()}
              disabled={lookupLoading || receiverAccNo.length !== 10}
              className="shrink-0"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              <span>Verify</span>
            </Button>
          </div>

          {/* Digit counter */}
          <p className="text-[11px] text-slate-600 text-right">{receiverAccNo.length}/10 digits</p>

          {/* Error state */}
          {lookupError && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Success — receiver confirmed */}
          {lookupResult?.found && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <UserCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">{lookupResult.full_name}</p>
                  <p className="text-[11px] text-emerald-500 font-mono">
                    Acc: {lookupResult.paypilot_account_number}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* ── 2. Transaction Details ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Deal Title / Subject <span className="text-cyan-400">*</span>
            </label>
            <Input
              placeholder="e.g. iPhone 15 Pro Max 256GB or Website UI Design"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Category</label>
            <Select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Electronics">Electronics &amp; Gadgets</option>
              <option value="Services">Professional Services &amp; Freelance</option>
              <option value="Mobile Devices">Mobile Devices &amp; Tablets</option>
              <option value="Vehicles">Automotive &amp; Parts</option>
              <option value="General Goods">General Merchandise</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Inspection Period (Days)</label>
            <Select value={inspectionDays} onChange={e => setInspectionDays(e.target.value)}>
              <option value="1">1 Day Inspection</option>
              <option value="3">3 Days Inspection (Recommended)</option>
              <option value="5">5 Days Inspection</option>
              <option value="7">7 Days Inspection</option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Detailed Terms &amp; Specification</label>
            <textarea
              className="flex min-h-[90px] w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              placeholder="Describe condition, deliverables, serial numbers, and return conditions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* ── 3. Escrow Financial Breakdown ── */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Item / Contract Price (NGN) <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₦</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-8 text-base font-bold text-cyan-300"
              />
            </div>
          </div>

          {parsedAmount > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Escrow Item Price:</span>
                <span>{formatCurrency(parsedAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PayPilot Fee (1.5% capped @ ₦2,000):</span>
                <span>{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-100 pt-1 border-t border-slate-800/60">
                <span>Total Upfront Escrow Lock:</span>
                <span className="text-cyan-400">{formatCurrency(totalDeduction)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Your Available Wallet Balance:</span>
            <span className={`font-semibold ${hasSufficientBalance ? 'text-emerald-400' : 'text-red-400'}`}>
              {balanceLoading ? '...' : formatCurrency(walletBalance)}
            </span>
          </div>
        </div>

        {/* ── Submit ── */}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full flex items-center justify-center space-x-2"
          disabled={submitting || !lookupResult?.found}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>Creating Escrow...</span></>
          ) : (
            <><span>Fund &amp; Initialize Escrow Deal</span><ArrowRight className="h-4 w-4" /></>
          )}
        </Button>

        {!lookupResult?.found && (
          <p className="text-center text-[11px] text-slate-500">
            Verify the receiver's PayPilot account number above to enable submission
          </p>
        )}

      </form>
    </Card>
  );
}
