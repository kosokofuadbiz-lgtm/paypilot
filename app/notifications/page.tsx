'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { Bell, CheckCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const currentUser = mockStore.getCurrentUser();
  const notifications = mockStore.getNotifications(currentUser.id);

  const handleMarkAllRead = () => {
    mockStore.markNotificationsRead(currentUser.id);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Bell className="h-6 w-6 text-cyan-400" />
              <span>Notifications & Activity Alerts</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time alerts for wallet funding, goods delivery, and payout releases</p>
          </div>

          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="flex items-center space-x-1 text-xs">
              <CheckCheck className="h-4 w-4 text-cyan-400" />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>

        {/* Notification Cards */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <CardContent className="px-0 py-0 divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Bell className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Your notification inbox is clean.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-4 px-3 rounded-xl transition-colors ${
                    !n.is_read ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block mt-2">{formatDate(n.created_at)}</span>
                    </div>

                    {n.link_url && (
                      <Link href={n.link_url}>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 text-xs">
                          <span>View Deal</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
