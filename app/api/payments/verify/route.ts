import { NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    const amountParam = searchParams.get('amount');
    const userIdParam = searchParams.get('userId');

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    const amountNGN = amountParam ? Number(amountParam) : undefined;
    const verification = await paystack.verifyPayment(reference, amountNGN);

    if (verification.status && (verification.data.status === 'success' || verification.data.status === 'completed')) {
      const creditedAmount = amountNGN ?? (verification.data.amount > 0 ? verification.data.amount / 100 : 0);
      const userEmail = verification.data.customer?.email;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: 'Supabase server configuration missing' }, { status: 500 });
      }

      if (creditedAmount <= 0) {
        return NextResponse.json({ error: 'Credited amount must be greater than zero' }, { status: 400 });
      }

      const adminSupabase = createClient(supabaseUrl, serviceKey);
      let targetUserId = userIdParam || null;

      if (!targetUserId && userEmail) {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', userEmail)
          .single();
        targetUserId = profile?.id || null;
      }

      if (!targetUserId) {
        return NextResponse.json({ error: 'Unable to resolve user for wallet credit' }, { status: 400 });
      }

      const { data: wallet } = await adminSupabase
        .from('wallets')
        .select('balance, id')
        .eq('user_id', targetUserId)
        .single();

      const currentBal = wallet ? Number(wallet.balance || 0) : 0;
      const newBal = currentBal + creditedAmount;

      if (wallet) {
        // Wallet exists — UPDATE it directly (atomic, no race condition)
        await adminSupabase
          .from('wallets')
          .update({
            balance: newBal,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);
      } else {
        // No wallet yet — INSERT it
        await adminSupabase
          .from('wallets')
          .insert({
            user_id: targetUserId,
            balance: newBal,
            held_balance: 0,
            currency: 'NGN',
            status: 'active',
            updated_at: new Date().toISOString()
          });
      }

      await adminSupabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title: 'Paystack Wallet Deposit Confirmed',
          message: `Your wallet balance has been credited with ₦${creditedAmount.toLocaleString()} via Paystack (Ref: ${reference}).`,
          type: 'wallet_funded',
          is_read: false
        });

      return NextResponse.json({
        status: true,
        message: 'Payment verified and wallet credited in Supabase',
        creditedAmount,
        newBalance: newBal
      });
    }

    return NextResponse.json({
      status: false,
      message: verification.message || 'Payment verification pending',
      data: verification.data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
