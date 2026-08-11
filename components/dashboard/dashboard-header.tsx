'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch wallet balance for the header badge whenever user changes
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/user/wallet?userId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(data => { if (data.balance !== undefined) setWalletBalance(Number(data.balance || 0)); })
      .catch(() => {});
  }, [user?.id]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const isAdmin = profile?.role === 'admin';

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-100">Pay<span className="text-cyan-400">Pilot</span></span>
              <span className="ml-2 hidden rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 sm:inline-block">ESCROW NG</span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons & Profile Controls */}
        <div className="flex items-center space-x-3">

          {/* Wallet Quick Balance Badge */}
          <div className="hidden md:flex items-center rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300">
            <span className="text-slate-400 mr-1.5">Wallet:</span>
            <span className="font-semibold text-emerald-400">{formatCurrency(walletBalance)}</span>
          </div>

          {/* Notifications Button */}
          <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </Link>

          {/* Admin Link if role === 'admin' */}
          {isAdmin && (
            <Link href="/admin">
              <Badge variant="purple" className="cursor-pointer hover:bg-purple-500/20">
                Admin Suite
              </Badge>
            </Link>
          )}

          {/* User Profile Avatar */}
          <Link href="/profile" className="flex items-center space-x-2 pl-2">
            <Avatar className="h-9 w-9 ring-2 ring-cyan-500/30">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-none">{displayName}</span>
              <span className="text-[10px] text-slate-400 leading-none mt-1">{displayEmail}</span>
            </div>
          </Link>

          {/* Sign Out Button */}
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-4 w-4 text-slate-400 hover:text-red-400" />
          </Button>

        </div>

      </div>
    </header>
  );
}
