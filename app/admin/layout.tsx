'use client';

import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { mockStore } from '@/lib/supabase/mock-store';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = mockStore.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Admin Privileges Required</h2>
          <p className="text-xs text-red-300/80 leading-relaxed">
            Your current persona ({currentUser.full_name}) does not have administrative access. Switch identity to Admin in the top header menu.
          </p>
          <Link href="/dashboard" className="inline-block">
            <Button variant="outline" className="flex items-center space-x-2 border-slate-700">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to User Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
