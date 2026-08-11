'use client';

import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Zap, ShieldCheck } from 'lucide-react';

interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FundWalletModal({ open, onOpenChange }: FundWalletModalProps) {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
  };

  const handleFundWithPaystack = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 500) {
      setErrorMsg('Minimum deposit amount is ₦500');
      return;
    }

    if (!user?.id) {
      setErrorMsg('You must be logged in to fund your wallet.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Use real email from Supabase auth — critical for Paystack to link back to the right user
      const userEmail = profile?.email || user?.email || '';

      const response = await fetch('/api/payments/fund-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          amount: num,
          userId: user.id   // Real Supabase UUID — used by verify route to credit the correct wallet
        })
      });

      const res = await response.json();

      if (res.status && res.data?.authorization_url) {
        // Redirect to Paystack official payment checkout page
        window.location.href = res.data.authorization_url;
      } else {
        setErrorMsg(res.error || res.message || 'Failed to initialize Paystack checkout.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error initializing Paystack.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2 text-cyan-400">
          <CreditCard className="h-5 w-5" />
          <span>Fund Wallet via Paystack</span>
        </DialogTitle>
        <DialogDescription>
          Enter the deposit amount to redirect to Paystack payment checkout.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {errorMsg && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">Select Preset Deposit Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {[5000, 10000, 25000, 50000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickSelect(val)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  amount === val.toString()
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900'
                }`}
              >
                ₦{val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-xs font-medium text-slate-300 mb-1.5 block">Deposit Amount (NGN)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₦</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 text-base font-semibold"
              placeholder="Enter amount"
              min="500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Minimum deposit: ₦500</p>
        </div>

        {/* Security Note */}
        <div className="flex items-center space-x-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-cyan-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>Paystack PCI-DSS 256-bit encrypted card &amp; bank transfer portal.</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="gradient" onClick={handleFundWithPaystack} disabled={loading}>
          {loading ? (
            <span className="flex items-center space-x-2">
              <Zap className="h-4 w-4 animate-spin" />
              <span>Redirecting to Paystack...</span>
            </span>
          ) : (
            <span>Proceed to Paystack Checkout</span>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
