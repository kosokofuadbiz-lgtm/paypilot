'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { ArrowLeftRight, PlusCircle, Search, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getEscrowStatusBadge } from '@/lib/utils';
import { EscrowTransaction } from '@/lib/types';
import { mockStore } from '@/lib/supabase/mock-store';

export default function TransactionsListPage() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetch(`/api/transactions?userId=${encodeURIComponent(user.id)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEscrows(data);
        } else {
          setEscrows(mockStore.getEscrowTransactions(user.id));
        }
      })
      .catch(() => {
        setEscrows(mockStore.getEscrowTransactions(user.id));
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredEscrows = escrows.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.seller_name && e.seller_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.buyer_name && e.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-cyan-400" />
              <span>Escrow Transactions</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage active, completed, and disputed escrow deals</p>
          </div>

          <Link href="/transactions/create">
            <Button variant="gradient" size="sm" className="flex items-center space-x-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Create New Escrow</span>
            </Button>
          </Link>
        </div>

        {/* Filter Controls */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search deal title or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
              {['all', 'funded', 'goods_sent', 'completed', 'disputed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Escrows' : st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

          </div>
        </Card>

        {/* Transactions List Grid */}
        <div className="space-y-3">
          {loading ? (
            <Card className="border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 text-cyan-400 animate-spin mb-2" />
              <p className="text-xs text-slate-400">Loading escrow transactions...</p>
            </Card>
          ) : filteredEscrows.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-12 text-center">
              <p className="text-sm font-semibold text-slate-400">No escrow transactions match your filter criteria.</p>
            </Card>
          ) : (
            filteredEscrows.map((escrow) => {
              const isBuyer = escrow.buyer_id === user?.id;
              const statusBadge = getEscrowStatusBadge(escrow.status);

              return (
                <Link key={escrow.id} href={`/transactions/${escrow.id}`}>
                  <Card className="border-slate-800 bg-slate-900/80 p-5 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      
                      <div className="flex items-start space-x-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                          isBuyer ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        }`}>
                          <ArrowLeftRight className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {escrow.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{escrow.description}</p>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-2">
                            <span>Role: <strong className="text-slate-300">{isBuyer ? 'Buyer' : 'Seller'}</strong></span>
                            <span>•</span>
                            <span>Other Party: <strong className="text-slate-300">{isBuyer ? (escrow.seller_name || 'Seller') : (escrow.buyer_name || 'Buyer')}</strong></span>
                            <span>•</span>
                            <span>{formatDate(escrow.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <span className="text-lg font-extrabold text-slate-100">{formatCurrency(escrow.amount)}</span>
                        <Badge variant="outline" className={`mt-1 text-xs ${statusBadge.variant}`}>
                          {statusBadge.label}
                        </Badge>
                      </div>

                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
