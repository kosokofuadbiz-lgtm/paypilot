'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowLeftRight, ArrowUpRight, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency } from '@/lib/utils';

export default function AdminOverviewPage() {
  const stats = mockStore.getAdminStats();

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-purple-400" />
          <span>PayPilot Admin Overview</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Platform analytics, liquidity volume, pending payouts, and active disputes</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3">{stats.totalUsers}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered profiles in DB</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Escrows</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3">{stats.activeEscrows}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Funded & goods_sent state</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Escrow Volume</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-300 mt-3">{formatCurrency(stats.totalEscrowVolume)}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Lifetime gross deal value</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Withdrawals</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-300 mt-3">{formatCurrency(stats.pendingWithdrawalsAmount)}</p>
          <span className="text-[10px] text-amber-400/80 mt-1 block">{stats.pendingWithdrawalsCount} payout requests pending</span>
        </Card>

      </div>

      {/* Quick Access Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Link href="/admin/withdrawals">
          <Card className="border-slate-800 bg-slate-900/60 p-6 hover:border-purple-500/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Review Pending Withdrawals
                </h3>
                <p className="text-xs text-slate-400">Approve or decline user bank payout transfers</p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/ongoing-transactions">
          <Card className="border-slate-800 bg-slate-900/60 p-6 hover:border-purple-500/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Monitor Ongoing Escrows
                </h3>
                <p className="text-xs text-slate-400">Inspect active locked escrows and resolve disputes</p>
              </div>
              <Activity className="h-6 w-6 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

      </div>

    </div>
  );
}
