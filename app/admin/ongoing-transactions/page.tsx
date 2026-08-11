'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency, formatDate, getEscrowStatusBadge } from '@/lib/utils';

export default function AdminOngoingTransactionsPage() {
  const currentUser = mockStore.getCurrentUser();
  const allEscrows = mockStore.getEscrowTransactions();
  const ongoing = allEscrows.filter(e => e.status === 'funded' || e.status === 'goods_sent' || e.status === 'disputed');

  const handleAdminForceRelease = (id: string, title: string, sellerName?: string) => {
    if (!confirm(`ADMIN OVERRIDE: Force release escrow funds for "${title}" to ${sellerName || 'Seller'}?`)) return;
    
    try {
      mockStore.updateEscrowStatus(id, 'completed', currentUser.id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-400" />
          <span>Active Escrow Monitor & Emergency Override</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Intervene, resolve disputes, or force release locked escrow funds</p>
      </div>

      <div className="space-y-4">
        {ongoing.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 p-12 text-center">
            <p className="text-sm font-semibold text-slate-400">No active or disputed escrow transactions pending completion.</p>
          </Card>
        ) : (
          ongoing.map((e) => {
            const statusBadge = getEscrowStatusBadge(e.status);

            return (
              <Card key={e.id} className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400">#{e.id}</span>
                    <h3 className="text-base font-bold text-slate-100">{e.title}</h3>
                  </div>
                  <Badge variant="outline" className={`text-xs ${statusBadge.variant}`}>
                    {statusBadge.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Buyer:</span>
                    <p className="font-semibold text-slate-200">{e.buyer_name} ({e.buyer_email})</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Seller:</span>
                    <p className="font-semibold text-slate-200">{e.seller_name} ({e.seller_email})</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Escrow Value:</span>
                    <p className="font-extrabold text-emerald-400 text-sm">{formatCurrency(e.amount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <Link href={`/transactions/${e.id}`} className="text-xs text-cyan-400 font-semibold hover:underline">
                    Inspect Deal Details →
                  </Link>

                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => handleAdminForceRelease(e.id, e.title, e.seller_name)}
                    className="flex items-center space-x-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Admin Force Release</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
