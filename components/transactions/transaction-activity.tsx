'use client';

import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TransactionActivity } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TransactionActivityFeedProps {
  activities: TransactionActivity[];
}

export function TransactionActivityFeed({ activities }: TransactionActivityFeedProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-800">
        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
          <History className="h-5 w-5 text-cyan-400" />
          <span>Audit Log & Activity Feed</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 pb-0 pt-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-cyan-400 shrink-0">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(act.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                  <span className="text-[10px] text-cyan-400/80 mt-1 block">Actor: {act.actor_name || 'System User'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
