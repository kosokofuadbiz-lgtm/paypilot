import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function generateAccountNumber(): string {
  const suffix = Math.floor(Math.random() * 100_000_000).toString().padStart(8, '0');
  return `90${suffix}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server configuration missing' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const { data: wallet, error } = await adminSupabase
      .from('wallets')
      .select('balance, held_balance, currency, status, paypilot_account_number')
      .eq('user_id', userId)
      .single();

    if (error || !wallet) {
      // Wallet missing — create it with a unique account number
      let accountNumber = '';
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateAccountNumber();
        const { data: collision } = await adminSupabase
          .from('wallets')
          .select('id')
          .eq('paypilot_account_number', candidate)
          .maybeSingle();
        if (!collision) { accountNumber = candidate; break; }
      }

      const { data: created, error: createError } = await adminSupabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          held_balance: 0,
          currency: 'NGN',
          status: 'active',
          paypilot_account_number: accountNumber,
          updated_at: new Date().toISOString(),
        })
        .select('balance, held_balance, currency, status, paypilot_account_number')
        .single();

      if (createError || !created) {
        return NextResponse.json({ error: createError?.message || 'Unable to initialize wallet' }, { status: 500 });
      }

      return NextResponse.json({
        balance: 0,
        held_balance: 0,
        currency: 'NGN',
        status: 'active',
        paypilot_account_number: created.paypilot_account_number || accountNumber,
        source: 'created',
      });
    }

    // Wallet exists but missing account number (legacy row) — backfill it
    if (!wallet.paypilot_account_number) {
      let accountNumber = '';
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateAccountNumber();
        const { data: collision } = await adminSupabase
          .from('wallets').select('id').eq('paypilot_account_number', candidate).maybeSingle();
        if (!collision) { accountNumber = candidate; break; }
      }
      if (accountNumber) {
        await adminSupabase.from('wallets').update({ paypilot_account_number: accountNumber }).eq('user_id', userId);
        wallet.paypilot_account_number = accountNumber;
      }
    }

    return NextResponse.json({
      balance: Number(wallet.balance || 0),
      held_balance: Number(wallet.held_balance || 0),
      currency: wallet.currency,
      status: wallet.status,
      paypilot_account_number: wallet.paypilot_account_number || '',
      source: 'supabase',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
