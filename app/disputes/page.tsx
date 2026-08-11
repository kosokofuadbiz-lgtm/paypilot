'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatDate, getDisputeStatusBadge } from '@/lib/utils';

export default function DisputesPage() {
  const currentUser = mockStore.getCurrentUser();
  const disputes = mockStore.getDisputes(currentUser.id);

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDisputes = disputes.filter((d) => {
    return statusFilter === 'all' || d.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <span>Disputes & Arbitration Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Review active claims and resolution status for disputed escrows</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2">
          {['all', 'open', 'under_review', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Disputes' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dispute Cards */}
        <div className="space-y-4">
          {filteredDisputes.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No active disputes found.</p>
              <p className="text-xs text-slate-500 mt-1">All your escrow deals are operating normally.</p>
            </Card>
          ) : (
            filteredDisputes.map((dispute) => {
              const statusBadge = getDisputeStatusBadge(dispute.status);

              return (
                <Card key={dispute.id} className="border-slate-800 bg-slate-900/80 p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        Dispute Ticket #{dispute.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">{dispute.title}</h3>
                    </div>
                    <Badge variant="outline" className={`text-xs ${statusBadge.variant}`}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{dispute.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                    <span>Opened by: <strong className="text-slate-300">{dispute.raised_by_name} ({dispute.raised_by_role})</strong></span>
                    <Link href={`/transactions/${dispute.transaction_id}`} className="text-cyan-400 font-semibold hover:underline">
                      View Escrow Deal #{dispute.transaction_id} →
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
