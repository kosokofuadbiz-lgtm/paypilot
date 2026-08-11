export type UserRole = 'user' | 'admin';

export type EscrowStatus = 
  | 'pending'
  | 'funded'
  | 'goods_sent'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type DisputeStatus = 
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'closed';

export type DisputeCategory = 
  | 'item_not_received'
  | 'item_not_as_described'
  | 'payment_issue'
  | 'seller_unresponsive'
  | 'buyer_unresponsive'
  | 'other';

export type WithdrawalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected';

export type NotificationType =
  | 'wallet_funded'
  | 'escrow_created'
  | 'escrow_funded'
  | 'goods_sent'
  | 'funds_released'
  | 'dispute_raised'
  | 'dispute_updated'
  | 'withdrawal_requested'
  | 'withdrawal_approved'
  | 'withdrawal_rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role: UserRole;
  real_bank_name?: string;
  real_account_number?: string;
  real_account_name?: string;
  paypilot_account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  held_balance: number;
  currency: string;
  status: 'active' | 'frozen';
  paypilot_account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  fee: number;
  buyer_id: string;
  seller_id: string;
  buyer_email?: string;
  seller_email?: string;
  buyer_name?: string;
  seller_name?: string;
  status: EscrowStatus;
  payment_reference?: string;
  item_category?: string;
  inspection_period_days?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TransactionActivity {
  id: string;
  transaction_id: string;
  actor_id: string;
  actor_name?: string;
  action: string;
  details: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  transaction_id: string;
  raised_by_id: string;
  raised_by_name?: string;
  raised_by_role?: 'buyer' | 'seller';
  type: DisputeCategory;
  title: string;
  description: string;
  status: DisputeStatus;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeEscrows: number;
  totalEscrowVolume: number;
  pendingWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
  openDisputesCount: number;
}
