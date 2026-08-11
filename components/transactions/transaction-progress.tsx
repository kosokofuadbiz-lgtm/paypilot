'use client';

import React from 'react';
import { CheckCircle2, Lock, PackageCheck, PartyPopper, AlertTriangle } from 'lucide-react';
import { EscrowStatus } from '@/lib/types';

interface TransactionProgressProps {
  status: EscrowStatus;
}

export function TransactionProgress({ status }: TransactionProgressProps) {
  const steps = [
    { key: 'funded', label: 'Escrow Funded', icon: Lock },
    { key: 'goods_sent', label: 'Goods Sent', icon: PackageCheck },
    { key: 'completed', label: 'Funds Released', icon: PartyPopper },
  ];

  const getStepState = (stepKey: string) => {
    if (status === 'disputed') return 'disputed';
    if (status === 'completed') return 'completed';
    if (status === 'goods_sent') {
      return stepKey === 'completed' ? 'upcoming' : 'completed';
    }
    if (status === 'funded') {
      return stepKey === 'funded' ? 'current' : 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Escrow Lifecycle Timeline
      </h4>

      {status === 'disputed' ? (
        <div className="flex items-center space-x-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Transaction paused on Dispute Hold — awaiting resolution.</span>
        </div>
      ) : (
        <div className="relative flex items-center justify-between">
          
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />

          {steps.map((step, idx) => {
            const state = getStepState(step.key);
            const Icon = step.icon;

            const isDone = state === 'completed';
            const isCurrent = state === 'current';

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-4 ring-cyan-500/20'
                      : 'border-slate-700 bg-slate-900 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isDone ? 'text-emerald-400' : isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
