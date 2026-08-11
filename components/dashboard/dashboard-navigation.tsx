'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, AlertTriangle, ArrowUpRight, User, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Escrows', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Disputes', href: '/disputes', icon: AlertTriangle },
    { name: 'Withdrawals', href: '/withdrawals', icon: ArrowUpRight },
    { name: 'Profile & Bank', href: '/profile', icon: User },
  ];

  return (
    <div className="border-b border-slate-800/60 bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Primary CTA button */}
        <div className="py-2 pl-4">
          <Link href="/transactions/create">
            <button className="inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:brightness-110 transition-all">
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Create Escrow</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
