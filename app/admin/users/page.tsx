'use client';

import React from 'react';
import { Users, ShieldCheck, Mail, Phone, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const profiles = mockStore.getProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-400" />
          <span>User Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Inspect registered users, balances, and bank settlement details</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Identity</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Wallet Balance</TableHead>
              <TableHead>Settlement Bank Account</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const wallet = mockStore.getWallet(p.id);
              const hasBank = Boolean(p.real_bank_name && p.real_account_number);

              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-100">{p.full_name}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                      {p.phone_number && <p className="text-[11px] text-slate-500">{p.phone_number}</p>}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={p.role === 'admin' ? 'purple' : 'secondary'} className="text-[10px]">
                      {p.role.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-emerald-400">{formatCurrency(wallet.balance)}</span>
                    {wallet.held_balance > 0 && (
                      <span className="text-[10px] text-amber-400 block">({formatCurrency(wallet.held_balance)} held)</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {hasBank ? (
                      <div className="text-xs">
                        <p className="font-semibold text-slate-200">{p.real_bank_name}</p>
                        <p className="text-[11px] text-slate-400">{p.real_account_number} ({p.real_account_name})</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No bank profile</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-400">
                    {formatDate(p.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
