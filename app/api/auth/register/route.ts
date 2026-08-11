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
    const { userId: inputUserId, email, fullName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY missing on server environment' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    let targetUserId = inputUserId;

    // 1. If inputUserId wasn't provided, check if user profile exists by email in Supabase
    if (!targetUserId) {
      const { data: existingProf } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProf?.id) {
        targetUserId = existingProf.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Supabase database error: auth.users trigger prevented user creation. Please log in with existing credentials.' },
        { status: 500 }
      );
    }

    // 2. Upsert profile row in Supabase profiles table
    const { error: profileErr } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          id: targetUserId,
          email,
          full_name: fullName || '',
          phone_number: '',
          role: 'user',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileErr) {
      return NextResponse.json({ error: `Profile creation failed: ${profileErr.message}` }, { status: 500 });
    }

    // 3. Check / generate unique PayPilot 10-digit account number starting with 90
    let accountNumber = '';
    const { data: existingWallet } = await adminSupabase
      .from('wallets')
      .select('paypilot_account_number')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (existingWallet?.paypilot_account_number) {
      accountNumber = existingWallet.paypilot_account_number;
    } else {
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
      if (!accountNumber) accountNumber = generateAccountNumber();

      // Upsert wallet in Supabase wallets table
      const { error: walletErr } = await adminSupabase
        .from('wallets')
        .upsert(
          {
            user_id: targetUserId,
            balance: 0,
            held_balance: 0,
            currency: 'NGN',
            status: 'active',
            paypilot_account_number: accountNumber,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (walletErr) {
        return NextResponse.json({ error: `Wallet creation failed: ${walletErr.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      paypilot_account_number: accountNumber,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
