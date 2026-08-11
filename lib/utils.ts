import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { EscrowStatus, DisputeStatus, WithdrawalStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace("NGN", "₦")
}

export function calculateEscrowFee(amount: number): number {
  // 1.5% fee capped at N2,000
  const feeRate = 0.015
  const calculatedFee = amount * feeRate
  return Math.min(calculatedFee, 2000)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getEscrowStatusBadge(status: EscrowStatus): { label: string; variant: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending Payment', variant: 'border-amber-500/30 text-amber-400 bg-amber-500/10' }
    case 'funded':
      return { label: 'Funded & Active', variant: 'border-blue-500/30 text-blue-400 bg-blue-500/10' }
    case 'goods_sent':
      return { label: 'Goods Sent', variant: 'border-purple-500/30 text-purple-400 bg-purple-500/10' }
    case 'completed':
      return { label: 'Funds Released', variant: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' }
    case 'disputed':
      return { label: 'Under Dispute', variant: 'border-red-500/30 text-red-400 bg-red-500/10' }
    case 'cancelled':
      return { label: 'Cancelled', variant: 'border-slate-500/30 text-slate-400 bg-slate-500/10' }
    default:
      return { label: status, variant: 'border-slate-500/30 text-slate-400 bg-slate-500/10' }
  }
}

export function getDisputeStatusBadge(status: DisputeStatus): { label: string; variant: string } {
  switch (status) {
    case 'open':
      return { label: 'Open', variant: 'border-amber-500/30 text-amber-400 bg-amber-500/10' }
    case 'under_review':
      return { label: 'Under Review', variant: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' }
    case 'resolved':
      return { label: 'Resolved', variant: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' }
    case 'closed':
      return { label: 'Closed', variant: 'border-slate-500/30 text-slate-400 bg-slate-500/10' }
  }
}

export function getWithdrawalStatusBadge(status: WithdrawalStatus): { label: string; variant: string } {
  switch (status) {
    case 'pending':
      return { label: 'Processing', variant: 'border-amber-500/30 text-amber-400 bg-amber-500/10' }
    case 'approved':
      return { label: 'Approved & Paid', variant: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' }
    case 'rejected':
      return { label: 'Rejected', variant: 'border-red-500/30 text-red-400 bg-red-500/10' }
  }
}
