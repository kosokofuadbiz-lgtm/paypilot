'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getEscrowStatusBadge } from '@/lib/utils';
import { EscrowTransaction } from '@/lib/types';
import { mockStore } from '@/lib/supabase/mock-store';

export function RecentTransactions() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetch(`/api/transactions?userId=${encodeURIComponent(user.id)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEscrows(data.slice(0, 5));
        } else {
          setEscrows(mockStore.getEscrowTransactions(user.id).slice(0, 5));
        }
      })
      .catch(() => {
        setEscrows(mockStore.getEscrowTransactions(user.id).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <Card className="border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-cyan-400" />
            <span>Recent Escrows</span>
          </CardTitle>
          <p className="text-xs text-slate-400">Track and manage active escrow payments</p>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading recent escrows...</p>
          </div>
        ) : escrows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No escrow transactions found</p>
            <Link href="/transactions/create" className="mt-3">
              <span className="text-xs text-cyan-400 font-semibold underline">Create your first escrow deal</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {escrows.map((escrow) => {
              const isBuyer = escrow.buyer_id === user?.id;
              const statusBadge = getEscrowStatusBadge(escrow.status);

              return (
                <Link
                  key={escrow.id}
                  href={`/transactions/${escrow.id}`}
                  className="group flex items-center justify-between py-3.5 px-2 hover:bg-slate-800/40 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        isBuyer
                          ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      <ArrowLeftRight className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {escrow.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{isBuyer ? `Seller: ${escrow.seller_name || 'Seller'}` : `Buyer: ${escrow.buyer_name || 'Buyer'}`}</span>
                        <span>•</span>
                        <span>{formatDate(escrow.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-sm font-bold text-slate-100">
                      {formatCurrency(escrow.amount)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${statusBadge.variant}`}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
