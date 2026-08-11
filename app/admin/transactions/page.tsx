'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockStore } from '@/lib/supabase/mock-store';
import { formatCurrency, formatDate, getEscrowStatusBadge } from '@/lib/utils';

export default function AdminTransactionsLedgerPage() {
  const allEscrows = mockStore.getEscrowTransactions();
  const [search, setSearch] = useState('');

  const filtered = allEscrows.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.buyer_name && e.buyer_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.seller_name && e.seller_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-purple-400" />
            <span>Escrow Transaction Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Comprehensive audit view of all system-wide escrow deals</p>
        </div>

        <div className="w-64">
          <Input
            placeholder="Search deals or parties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal Title & ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Amount & Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => {
              const statusBadge = getEscrowStatusBadge(e.status);

              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link href={`/transactions/${e.id}`} className="hover:underline">
                      <p className="font-bold text-slate-100">{e.title}</p>
                      <p className="text-[11px] text-purple-400 font-mono">#{e.id}</p>
                    </Link>
                  </TableCell>

                  <TableCell className="text-xs">
                    <p className="font-semibold text-slate-200">{e.buyer_name}</p>
                    <p className="text-[10px] text-slate-500">{e.buyer_email}</p>
                  </TableCell>

                  <TableCell className="text-xs">
                    <p className="font-semibold text-slate-200">{e.seller_name}</p>
                    <p className="text-[10px] text-slate-500">{e.seller_email}</p>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-slate-100">{formatCurrency(e.amount)}</span>
                    <span className="text-[10px] text-slate-500 block">Fee: {formatCurrency(e.fee)}</span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusBadge.variant}`}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-slate-400">
                    {formatDate(e.created_at)}
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
