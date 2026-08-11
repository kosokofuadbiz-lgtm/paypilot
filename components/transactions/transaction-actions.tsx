'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, PackageCheck, AlertTriangle, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { EscrowTransaction, DisputeCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { mockStore } from '@/lib/supabase/mock-store';

interface TransactionActionsProps {
  transaction: EscrowTransaction;
  onRefresh?: () => void;
}

export function TransactionActions({ transaction, onRefresh }: TransactionActionsProps) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const currentUserId = user?.id || '';
  const isBuyer = transaction.buyer_id === currentUserId;
  const isSeller = transaction.seller_id === currentUserId;

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Dispute Form State
  const [disputeType, setDisputeType] = useState<DisputeCategory>('item_not_as_described');
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');

  // 1. Seller Marks Goods / Services Sent
  const handleMarkGoodsSent = async () => {
    if (!confirm('Confirm that you have shipped the items or completed the digital services for this escrow?')) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_goods_sent',
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark goods sent.');

      setSuccessMsg('Delivered status submitted! Buyer has been notified to inspect and release funds.');
      if (onRefresh) onRefresh();
      else setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  // 2. Buyer Releases Funds to Seller Wallet
  const handleReleaseFunds = async () => {
    const sellerName = transaction.seller_name || 'the seller';
    if (
      !confirm(
        `Are you sure you want to release ${formatCurrency(transaction.amount)} from escrow to ${sellerName}? This will immediately transfer funds into their wallet and complete the deal.`
      )
    )
      return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release_funds',
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release funds.');

      setSuccessMsg(`Funds released! ${formatCurrency(transaction.amount)} credited to ${sellerName}'s wallet.`);
      if (onRefresh) onRefresh();
      else setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error releasing funds');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Dispute
  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTitle || !disputeDesc) {
      alert('Please fill in the dispute title and detailed explanation.');
      return;
    }

    setLoading(true);

    try {
      mockStore.createDispute({
        transaction_id: transaction.id,
        raised_by_id: currentUserId,
        raised_by_name: profile?.full_name || 'User',
        raised_by_role: isBuyer ? 'buyer' : 'seller',
        type: disputeType,
        title: disputeTitle,
        description: disputeDesc,
      });

      setShowDisputeModal(false);
      setSuccessMsg('Dispute ticket raised. Escrow funds placed on hold.');
      if (onRefresh) onRefresh();
      else setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-800">
          <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span>Escrow Controls</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">Available lifecycle actions for your account</p>
        </CardHeader>

        <CardContent className="px-0 pb-0 space-y-4 pt-2">

          {successMsg && (
            <div className="flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Completed State Banner */}
          {transaction.status === 'completed' && (
            <div className="flex items-center space-x-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">Escrow Completed!</p>
                <p className="text-emerald-400/80 mt-0.5">
                  {formatCurrency(transaction.amount)} has been transferred to {transaction.seller_name || 'the seller'}&apos;s wallet.
                </p>
              </div>
            </div>
          )}

          {/* Disputed State Banner */}
          {transaction.status === 'disputed' && (
            <div className="flex items-center space-x-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">Dispute Hold Active</p>
                <p className="text-red-400/80 mt-0.5">
                  Funds are frozen while PayPilot compliance team reviews evidence from both parties.
                </p>
              </div>
            </div>
          )}

          {/* ── SELLER (RECEIVER) BUTTON: Mark Goods / Services Sent ── */}
          {isSeller && transaction.status === 'funded' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-cyan-300">
                <p className="font-semibold">Step 1: Deliver Item or Service</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Once you ship the item or finish the contract, click below to notify the buyer to inspect and release funds.
                </p>
              </div>
              <Button
                variant="gradient"
                size="lg"
                className="w-full flex items-center justify-center space-x-2 py-6 text-sm"
                onClick={handleMarkGoodsSent}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <PackageCheck className="h-5 w-5" />
                    <span>Goods / Services Sent</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Seller view after marking sent */}
          {isSeller && transaction.status === 'goods_sent' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Goods / Services Marked Sent</p>
                <p className="text-emerald-400/80 text-[11px]">
                  Awaiting buyer to inspect and click <strong>Release Funds</strong> into your wallet.
                </p>
              </div>
            </div>
          )}

          {/* ── BUYER (PAYER) BUTTON: Release Funds ── */}
          {isBuyer && (transaction.status === 'funded' || transaction.status === 'goods_sent') && (
            <div className="space-y-2">
              {transaction.status === 'goods_sent' ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <p className="font-semibold">Seller marked items as delivered!</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Inspect the goods/services. If satisfied, click below to release <strong>{formatCurrency(transaction.amount)}</strong> to the seller.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">Escrow Funded &amp; Locked</p>
                  <p className="text-[11px] mt-0.5">
                    Awaiting seller to mark goods/services sent. You can also release funds once satisfied.
                  </p>
                </div>
              )}

              <Button
                variant="emerald"
                size="lg"
                className="w-full flex items-center justify-center space-x-2 py-6 text-sm font-bold shadow-lg shadow-emerald-500/20"
                onClick={handleReleaseFunds}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Release Funds to Seller ({formatCurrency(transaction.amount)})</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* ── IF USER IS NEITHER BUYER NOR SELLER (E.G. ADMIN OR PREVIEW) ── */}
          {!isBuyer && !isSeller && transaction.status !== 'completed' && transaction.status !== 'disputed' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Previewing action buttons for both roles:</p>
              <Button
                variant="gradient"
                className="w-full flex items-center justify-center space-x-2 text-xs"
                onClick={handleMarkGoodsSent}
                disabled={loading}
              >
                <PackageCheck className="h-4 w-4" />
                <span>[Seller Action] Goods / Services Sent</span>
              </Button>

              <Button
                variant="emerald"
                className="w-full flex items-center justify-center space-x-2 text-xs"
                onClick={handleReleaseFunds}
                disabled={loading}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>[Buyer Action] Release Funds ({formatCurrency(transaction.amount)})</span>
              </Button>
            </div>
          )}

          {/* Raise Dispute button (available for active transactions) */}
          {(transaction.status === 'funded' || transaction.status === 'goods_sent') && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
              onClick={() => setShowDisputeModal(true)}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Raise Dispute</span>
            </Button>
          )}

        </CardContent>
      </Card>

      {/* Raise Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Open Dispute Ticket</span>
          </DialogTitle>
          <DialogDescription>
            Freeze escrow funds and request PayPilot resolution support for deal #{transaction.id}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRaiseDispute} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Dispute Category</label>
            <Select value={disputeType} onChange={(e) => setDisputeType(e.target.value as DisputeCategory)}>
              <option value="item_not_as_described">Item / Deliverable Not As Described</option>
              <option value="item_not_received">Item Not Received / Delayed Delivery</option>
              <option value="seller_unresponsive">Seller Unresponsive</option>
              <option value="buyer_unresponsive">Buyer Unresponsive</option>
              <option value="other">Other Dispute Reason</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Dispute Summary Title</label>
            <Input
              placeholder="Brief summary of the issue..."
              value={disputeTitle}
              onChange={(e) => setDisputeTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Detailed Explanation &amp; Evidence</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              placeholder="Describe what went wrong, tracking numbers, or agreed specifications..."
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setShowDisputeModal(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              Submit Dispute
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
