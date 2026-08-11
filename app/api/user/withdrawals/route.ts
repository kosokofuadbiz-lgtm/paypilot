import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawals) return NextResponse.json(withdrawals);
    }
  } catch (e) {
    // Fallback
  }

  const currentUser = mockStore.getCurrentUser();
  const withdrawals = mockStore.getWithdrawals(currentUser.id);
  return NextResponse.json(withdrawals);
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch user profile for bank details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.real_bank_name || !profile.real_account_number) {
        return NextResponse.json({ error: 'Bank details missing in Profile settings.' }, { status: 400 });
      }

      // Fetch user wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const currentBal = wallet ? Number(wallet.balance || 0) : 0;
      const currentHeld = wallet ? Number(wallet.held_balance || 0) : 0;

      if (currentBal < amount) {
        return NextResponse.json({ error: `Insufficient wallet balance. Available: ₦${currentBal.toLocaleString()}` }, { status: 400 });
      }

      // Debit balance & move to held_balance in Supabase Postgres
      await supabase
        .from('wallets')
        .update({
          balance: currentBal - amount,
          held_balance: currentHeld + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Insert withdrawal request
      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          bank_name: profile.real_bank_name,
          account_number: profile.real_account_number,
          account_name: profile.real_account_name || profile.full_name,
          status: 'pending'
        })
        .select()
        .single();

      if (!error && withdrawal) {
        return NextResponse.json(withdrawal, { status: 201 });
      }
    }
  } catch (e) {
    // Fallback
  }

  return NextResponse.json({ error: 'Failed to request withdrawal' }, { status: 400 });
}
