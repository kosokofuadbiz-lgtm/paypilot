'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2, XCircle, Building, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency, formatDate, getWithdrawalStatusBadge } from '@/lib/utils';

export default function AdminWithdrawalsApprovalPage() {
  const withdrawals = mockStore.getWithdrawals();

  const handleApprove = (id: string, amount: number) => {
    if (!confirm(`Approve payout transfer of ${formatCurrency(amount)} to user bank account?`)) return;
    try {
      mockStore.processWithdrawal(id, true);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = (id: string, amount: number) => {
    const reason = prompt(`Enter rejection reason for payout of ${formatCurrency(amount)}:`, 'Account name mismatch');
    if (reason === null) return;
    
    try {
      mockStore.processWithdrawal(id, false, reason);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ArrowUpRight className="h-6 w-6 text-amber-400" />
          <span>Withdrawal Payout Approvals</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Approve or decline user bank payout requests</p>
      </div>

      <div className="space-y-4">
        {withdrawals.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 p-12 text-center">
            <p className="text-sm font-semibold text-slate-400">No withdrawal requests found.</p>
          </Card>
        ) : (
          withdrawals.map((w) => {
            const statusBadge = getWithdrawalStatusBadge(w.status);
            const user = mockStore.getProfiles().find(p => p.id === w.user_id);

            return (
              <Card key={w.id} className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">Ref #{w.id}</span>
                    <h3 className="text-lg font-bold text-slate-100">{formatCurrency(w.amount)} Payout</h3>
                  </div>
                  <Badge variant="outline" className={`text-xs ${statusBadge.variant}`}>
                    {statusBadge.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Requested By:</span>
                    <p className="font-semibold text-slate-200">{user?.full_name || 'User'} ({user?.email})</p>
                    <p className="text-[11px] text-slate-400">Requested: {formatDate(w.created_at)}</p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Target Bank Account</span>
                    <p className="font-bold text-slate-100 text-sm mt-0.5">{w.bank_name}</p>
                    <p className="text-slate-300 font-mono">{w.account_number}</p>
                    <p className="text-slate-400 text-[11px]">Name: {w.account_name}</p>
                  </div>
                </div>

                {w.rejection_reason && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                    Rejection Reason: {w.rejection_reason}
                  </p>
                )}

                {w.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(w.id, w.amount)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Decline Request</span>
                    </Button>

                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => handleApprove(w.id, w.amount)}
                      className="flex items-center space-x-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Bank Transfer</span>
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
