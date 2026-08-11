'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { TransactionProgress } from '@/components/transactions/transaction-progress';
import { TransactionActions } from '@/components/transactions/transaction-actions';
import { TransactionActivityFeed } from '@/components/transactions/transaction-activity';
import { ArrowLeft, User, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getEscrowStatusBadge } from '@/lib/utils';
import { EscrowTransaction, TransactionActivity } from '@/lib/types';
import { mockStore } from '@/lib/supabase/mock-store';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/transactions/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setEscrow(data);
        } else {
          setEscrow(null);
        }
      })
      .catch(() => {
        setEscrow(null);
      })
      .finally(() => setLoading(false));
  }, [id, tick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardHeader />
        <DashboardNavigation />
        <main className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading escrow transaction details...</p>
        </main>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardHeader />
        <DashboardNavigation />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-200">Escrow Transaction Not Found</h2>
          <p className="text-xs text-slate-400 mt-2">The requested escrow transaction ID does not exist.</p>
          <Link href="/transactions" className="mt-4 inline-block text-xs text-cyan-400 font-semibold underline">
            Return to Escrow List
          </Link>
        </main>
      </div>
    );
  }

  const isBuyer = escrow.buyer_id === user?.id;
  const isSeller = escrow.seller_id === user?.id;
  const statusBadge = getEscrowStatusBadge(escrow.status);
  const activities: TransactionActivity[] = mockStore.getActivities(escrow.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Back link */}
        <Link href="/transactions" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Transactions</span>
        </Link>

        {/* Top Header Card */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-100">{escrow.title}</h1>
                <Badge variant="outline" className={`text-xs ${statusBadge.variant}`}>
                  {statusBadge.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Deal Ref: <strong className="text-slate-300">#{escrow.id}</strong></span>
                <span>•</span>
                <span>Created {formatDate(escrow.created_at)}</span>
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-right">
              <span className="text-xs text-cyan-300/80 uppercase tracking-wider font-medium block">Escrow Amount</span>
              <span className="text-3xl font-extrabold text-cyan-300">{formatCurrency(escrow.amount)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">+ {formatCurrency(escrow.fee)} PayPilot fee</span>
            </div>

          </div>
        </Card>

        {/* Lifecycle Timeline */}
        <TransactionProgress status={escrow.status} />

        {/* Main Grid: Details + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 cols): Deal details & terms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Parties info card */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span>Transaction Counterparties</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Buyer (Payer)</span>
                  <p className="font-semibold text-slate-100 text-sm mt-1">{escrow.buyer_name || 'Buyer'}</p>
                  <p className="text-slate-400">{escrow.buyer_email}</p>
                  {isBuyer && <Badge variant="secondary" className="mt-2 text-[10px]">You are the Buyer</Badge>}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Seller (Recipient)</span>
                  <p className="font-semibold text-slate-100 text-sm mt-1">{escrow.seller_name || 'Seller'}</p>
                  <p className="text-slate-400">{escrow.seller_email}</p>
                  {isSeller && <Badge variant="emerald" className="mt-2 text-[10px]">You are the Seller</Badge>}
                </div>
              </div>
            </Card>

            {/* Description & Terms card */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Escrow Terms &amp; Specifications</span>
              </h3>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {escrow.description}
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
                <span>Inspection Window: <strong className="text-slate-200">{escrow.inspection_period_days || 3} Days</strong></span>
                <span>Category: <strong className="text-slate-200">{escrow.item_category || 'General'}</strong></span>
              </div>
            </Card>

            {/* Activity Feed */}
            <TransactionActivityFeed activities={activities} />

          </div>

          {/* Right Column (1 col): Escrow Action Panel */}
          <div className="lg:col-span-1">
            <TransactionActions transaction={escrow} onRefresh={refresh} />
          </div>

        </div>

      </main>
    </div>
  );
}
