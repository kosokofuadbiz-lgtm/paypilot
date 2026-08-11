'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeftRight, Activity, ArrowUpRight, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Escrow Ledger', href: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'Ongoing Escrows', href: '/admin/ongoing-transactions', icon: Activity },
    { name: 'Withdrawal Approvals', href: '/admin/withdrawals', icon: ArrowUpRight },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/90 min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center space-x-2.5 px-3 py-4 mb-4 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Admin Console</h2>
            <p className="text-[10px] text-purple-400 font-semibold">SUPERUSER OVERSIGHT</p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-slate-900">
          <CornerDownLeft className="h-4 w-4" />
          <span>Exit to User Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}
