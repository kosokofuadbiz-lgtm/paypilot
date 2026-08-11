import { 
  Profile, Wallet, EscrowTransaction, TransactionActivity, 
  Dispute, Withdrawal, Notification, AdminOverviewStats, EscrowStatus 
} from '../types';

// Default store state
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr_admin_1',
    email: 'admin@paypilot.ng',
    full_name: 'PayPilot Admin',
    phone_number: '',
    role: 'admin',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_WALLETS: Wallet[] = [];

const INITIAL_ESCROWS: EscrowTransaction[] = [];

const INITIAL_ACTIVITIES: TransactionActivity[] = [];

const INITIAL_DISPUTES: Dispute[] = [];

const INITIAL_WITHDRAWALS: Withdrawal[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [];

class MockStore {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private wallets: Wallet[] = [...INITIAL_WALLETS];
  private escrows: EscrowTransaction[] = [...INITIAL_ESCROWS];
  private activities: TransactionActivity[] = [...INITIAL_ACTIVITIES];
  private disputes: Dispute[] = [...INITIAL_DISPUTES];
  private withdrawals: Withdrawal[] = [...INITIAL_WITHDRAWALS];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private currentUserId = '';
  private isLoaded = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('paypilot_store_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.profiles) this.profiles = parsed.profiles;
          if (parsed.wallets) this.wallets = parsed.wallets;
          if (parsed.escrows) this.escrows = parsed.escrows;
          if (parsed.activities) this.activities = parsed.activities;
          if (parsed.disputes) this.disputes = parsed.disputes;
          if (parsed.withdrawals) this.withdrawals = parsed.withdrawals;
          if (parsed.notifications) this.notifications = parsed.notifications;
          if (parsed.currentUserId) this.currentUserId = parsed.currentUserId;
        }
      } catch (e) {
        // Fallback
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const state = {
          profiles: this.profiles,
          wallets: this.wallets,
          escrows: this.escrows,
          activities: this.activities,
          disputes: this.disputes,
          withdrawals: this.withdrawals,
          notifications: this.notifications,
          currentUserId: this.currentUserId,
        };
        window.localStorage.setItem('paypilot_store_v2', JSON.stringify(state));
      } catch (e) {
        // Fallback
      }
    }
  }

  getCurrentUser(): Profile {
    this.loadFromStorage();
    let p = this.profiles.find(p => p.id === this.currentUserId);
    if (!p) {
      if (this.profiles.length > 0) {
        p = this.profiles[this.profiles.length - 1];
      } else {
        p = {
          id: 'usr_registered',
          email: 'user@paypilot.ng',
          full_name: 'New Registered User',
          phone_number: '',
          role: 'user',
          real_bank_name: '',
          real_account_number: '',
          real_account_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
    return p;
  }

  setCurrentUser(id: string) {
    const found = this.profiles.find(p => p.id === id);
    if (found) {
      this.currentUserId = found.id;
      this.saveToStorage();
    }
  }

  registerUser(email: string, fullName: string): Profile {
    this.loadFromStorage();
    const existing = this.getProfileByEmail(email);
    if (existing) {
      this.currentUserId = existing.id;
      this.saveToStorage();
      return existing;
    }

    const newId = `usr_${Date.now()}`;
    const newProf: Profile = {
      id: newId,
      email,
      full_name: fullName,
      phone_number: '',
      role: 'user',
      real_bank_name: '',
      real_account_number: '',
      real_account_name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.profiles.push(newProf);
    this.currentUserId = newId;

    // Create 0 balance wallet
    this.getWallet(newId);

    this.saveToStorage();
    return newProf;
  }

  getProfiles() {
    this.loadFromStorage();
    return this.profiles;
  }

  getProfileByEmail(email: string) {
    this.loadFromStorage();
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  updateProfile(userId: string, data: Partial<Profile>) {
    this.loadFromStorage();
    const idx = this.profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...data, updated_at: new Date().toISOString() };
      this.saveToStorage();
      return this.profiles[idx];
    }
    return null;
  }

  getWallet(userId: string): Wallet {
    this.loadFromStorage();
    let w = this.wallets.find(w => w.user_id === userId);
    if (!w) {
      const hashVal = Math.abs(userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 17) * 987654321).toString().padEnd(8, '3').slice(0, 8);
      const paypilotAcc = `90${hashVal}`;

      w = {
        id: `wlt_${Date.now()}`,
        user_id: userId,
        balance: 0,
        held_balance: 0,
        currency: 'NGN',
        status: 'active',
        paypilot_account_number: paypilotAcc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.wallets.push(w);
      this.saveToStorage();
    }
    return w;
  }

  creditWallet(userId: string, amount: number) {
    this.loadFromStorage();
    const w = this.getWallet(userId);
    w.balance += amount;
    w.updated_at = new Date().toISOString();
    this.saveToStorage();
    return w;
  }

  debitWallet(userId: string, amount: number) {
    this.loadFromStorage();
    const w = this.getWallet(userId);
    if (w.balance < amount) {
      throw new Error(`Insufficient wallet balance. Available: ₦${w.balance.toLocaleString()}`);
    }
    w.balance -= amount;
    w.updated_at = new Date().toISOString();
    this.saveToStorage();
    return w;
  }

  getEscrowTransactions(userId?: string): EscrowTransaction[] {
    this.loadFromStorage();
    if (!userId) return this.escrows;
    return this.escrows.filter(e => e.buyer_id === userId || e.seller_id === userId);
  }

  getEscrowById(id: string): EscrowTransaction | undefined {
    this.loadFromStorage();
    return this.escrows.find(e => e.id === id);
  }

  addOrUpdateEscrow(escrow: EscrowTransaction) {
    this.loadFromStorage();
    const idx = this.escrows.findIndex(e => e.id === escrow.id);
    if (idx !== -1) {
      this.escrows[idx] = { ...this.escrows[idx], ...escrow, updated_at: new Date().toISOString() };
    } else {
      this.escrows.unshift(escrow);
    }
    this.saveToStorage();
    return escrow;
  }

  createEscrow(data: Omit<EscrowTransaction, 'id' | 'created_at' | 'updated_at'>): EscrowTransaction {
    this.loadFromStorage();
    const newEscrow: EscrowTransaction = {
      ...data,
      id: `esc_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Debit buyer's wallet for total (amount + fee)
    const totalDeduction = newEscrow.amount + newEscrow.fee;
    this.debitWallet(newEscrow.buyer_id, totalDeduction);

    this.escrows.unshift(newEscrow);

    // Activity log
    this.addActivity(
      newEscrow.id,
      newEscrow.buyer_id,
      newEscrow.buyer_name || 'Buyer',
      'Escrow Created & Funded',
      `Created escrow for ₦${newEscrow.amount.toLocaleString()} + ₦${newEscrow.fee.toLocaleString()} fee.`
    );

    // Notify seller
    this.addNotification(
      newEscrow.seller_id,
      'New Escrow Transaction Received',
      `${newEscrow.buyer_name || 'A buyer'} funded a ₦${newEscrow.amount.toLocaleString()} escrow for "${newEscrow.title}".`,
      'escrow_funded',
      `/transactions/${newEscrow.id}`
    );

    this.saveToStorage();
    return newEscrow;
  }

  updateEscrowStatus(id: string, newStatus: EscrowStatus, actorId: string): EscrowTransaction {
    this.loadFromStorage();
    const e = this.getEscrowById(id);
    if (!e) throw new Error('Transaction not found');

    const oldStatus = e.status;
    e.status = newStatus;
    e.updated_at = new Date().toISOString();

    const actorProfile = this.profiles.find(p => p.id === actorId);
    const actorName = actorProfile?.full_name || 'User';

    if (newStatus === 'goods_sent') {
      this.addActivity(id, actorId, actorName, 'Goods / Delivery Sent', 'Seller marked items as sent/delivered.');
      this.addNotification(e.buyer_id, 'Delivery Update', `${e.seller_name} marked "${e.title}" as delivered. Please verify and release funds.`, 'goods_sent', `/transactions/${id}`);
    } else if (newStatus === 'completed') {
      e.completed_at = new Date().toISOString();
      // Credit seller wallet with escrow amount (fee retained by platform)
      this.creditWallet(e.seller_id, e.amount);
      this.addActivity(id, actorId, actorName, 'Funds Released to Seller', `Buyer released ₦${e.amount.toLocaleString()} to seller wallet.`);
      this.addNotification(e.seller_id, 'Escrow Funds Received!', `₦${e.amount.toLocaleString()} released from escrow to your wallet balance.`, 'funds_released', `/transactions/${id}`);
      this.addNotification(e.buyer_id, 'Escrow Completed', `Transaction "${e.title}" completed successfully.`, 'funds_released', `/transactions/${id}`);
    } else if (newStatus === 'disputed') {
      this.addActivity(id, actorId, actorName, 'Dispute Opened', 'Transaction placed on dispute hold.');
    }

    this.saveToStorage();
    return e;
  }

  getActivities(transactionId: string): TransactionActivity[] {
    return this.activities.filter(a => a.transaction_id === transactionId);
  }

  addActivity(transactionId: string, actorId: string, actorName: string, action: string, details: string) {
    const act: TransactionActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      transaction_id: transactionId,
      actor_id: actorId,
      actor_name: actorName,
      action,
      details,
      created_at: new Date().toISOString()
    };
    this.activities.unshift(act);
    return act;
  }

  getDisputes(userId?: string): Dispute[] {
    if (!userId) return this.disputes;
    const userEscrowIds = new Set(this.getEscrowTransactions(userId).map(e => e.id));
    return this.disputes.filter(d => userEscrowIds.has(d.transaction_id) || d.raised_by_id === userId);
  }

  createDispute(data: Omit<Dispute, 'id' | 'created_at' | 'updated_at' | 'status'>): Dispute {
    const newDispute: Dispute = {
      ...data,
      id: `disp_${Date.now()}`,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.disputes.unshift(newDispute);
    this.updateEscrowStatus(data.transaction_id, 'disputed', data.raised_by_id);
    return newDispute;
  }

  getWithdrawals(userId?: string): Withdrawal[] {
    if (!userId) return this.withdrawals;
    return this.withdrawals.filter(w => w.user_id === userId);
  }

  requestWithdrawal(userId: string, amount: number): Withdrawal {
    const p = this.profiles.find(p => p.id === userId);
    if (!p || !p.real_bank_name || !p.real_account_number || !p.real_account_name) {
      throw new Error('Bank profile details missing. Please complete your bank details in Profile settings before requesting withdrawals.');
    }

    const wlt = this.getWallet(userId);
    if (wlt.balance < amount) {
      throw new Error(`Insufficient wallet balance for withdrawal. Available: ₦${wlt.balance.toLocaleString()}`);
    }

    // Debit balance and add to held balance
    wlt.balance -= amount;
    wlt.held_balance += amount;

    const w: Withdrawal = {
      id: `wth_${Date.now()}`,
      user_id: userId,
      amount,
      bank_name: p.real_bank_name,
      account_number: p.real_account_number,
      account_name: p.real_account_name,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.withdrawals.unshift(w);

    this.addNotification(userId, 'Withdrawal Request Submitted', `Your request for ₦${amount.toLocaleString()} payout to ${p.real_bank_name} is processing.`, 'withdrawal_requested');
    return w;
  }

  processWithdrawal(withdrawalId: string, approve: boolean, rejectionReason?: string): Withdrawal {
    const w = this.withdrawals.find(x => x.id === withdrawalId);
    if (!w) throw new Error('Withdrawal request not found');

    const wlt = this.getWallet(w.user_id);

    if (approve) {
      w.status = 'approved';
      wlt.held_balance = Math.max(0, wlt.held_balance - w.amount);
      this.addNotification(w.user_id, 'Withdrawal Approved!', `₦${w.amount.toLocaleString()} payout has been transferred to your bank account.`, 'withdrawal_approved');
    } else {
      w.status = 'rejected';
      w.rejection_reason = rejectionReason || 'Information mismatch or compliance check failed.';
      // Return held funds back to active balance
      wlt.held_balance = Math.max(0, wlt.held_balance - w.amount);
      wlt.balance += w.amount;
      this.addNotification(w.user_id, 'Withdrawal Request Declined', `₦${w.amount.toLocaleString()} returned to your active wallet. Reason: ${w.rejection_reason}`, 'withdrawal_rejected');
    }
    w.processed_at = new Date().toISOString();
    return w;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.user_id === userId);
  }

  addNotification(userId: string, title: string, message: string, type: Notification['type'], linkUrl?: string) {
    const n: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      link_url: linkUrl,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(n);
    return n;
  }

  markNotificationsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
  }

  getAdminStats(): AdminOverviewStats {
    const totalUsers = this.profiles.length;
    const activeEscrows = this.escrows.filter(e => e.status === 'funded' || e.status === 'goods_sent').length;
    const totalEscrowVolume = this.escrows.reduce((acc, e) => acc + e.amount, 0);
    const pendingW = this.withdrawals.filter(w => w.status === 'pending');
    const pendingWithdrawalsAmount = pendingW.reduce((acc, w) => acc + w.amount, 0);
    const openDisputesCount = this.disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;

    return {
      totalUsers,
      activeEscrows,
      totalEscrowVolume,
      pendingWithdrawalsAmount,
      pendingWithdrawalsCount: pendingW.length,
      openDisputesCount
    };
  }
}

// Singleton global instance
export const mockStore = new MockStore();
