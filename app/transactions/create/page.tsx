'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { CreateTransactionForm } from '@/components/transactions/create-transaction-form';

export default function CreateTransactionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <CreateTransactionForm />
      </main>
    </div>
  );
}
