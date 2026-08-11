import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** Generate a random 10-digit PayPilot account number starting with "90" */
function generateAccountNumber(): string {
  const suffix = Math.floor(Math.random() * 100_000_000)
    .toString()
    .padStart(8, '0');
  return `90${suffix}`;
}

export async function POST(req: Request) {
  try {
    const { userId, email, fullName } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    // Upsert profile row
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName || '',
          phone_number: '',
          role: 'user',
          real_bank_name: '',
          real_account_number: '',
          real_account_name: '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Check if wallet already exists (e.g. re-registration)
    const { data: existingWallet } = await adminSupabase
      .from('wallets')
      .select('id, paypilot_account_number')
      .eq('user_id', userId)
      .single();

    if (existingWallet) {
      // Wallet already created (possibly by a DB trigger) — just return success
      return NextResponse.json({
        success: true,
        paypilot_account_number: existingWallet.paypilot_account_number,
      });
    }

    // Generate a unique PayPilot account number (retry on collision)
    let accountNumber = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateAccountNumber();
      const { data: collision } = await adminSupabase
        .from('wallets')
        .select('id')
        .eq('paypilot_account_number', candidate)
        .maybeSingle();

      if (!collision) {
        accountNumber = candidate;
        break;
      }
    }

    if (!accountNumber) {
      return NextResponse.json({ error: 'Failed to generate unique account number' }, { status: 500 });
    }

    // Insert wallet with the unique account number
    const { error: walletError } = await adminSupabase.from('wallets').insert({
      user_id: userId,
      balance: 0,
      held_balance: 0,
      currency: 'NGN',
      status: 'active',
      paypilot_account_number: accountNumber,
      updated_at: new Date().toISOString(),
    });

    if (walletError) {
      console.error('Wallet insert error:', walletError);
      // Non-fatal — profile was created; wallet can be recreated via /api/user/wallet
    }

    return NextResponse.json({ success: true, paypilot_account_number: accountNumber });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
