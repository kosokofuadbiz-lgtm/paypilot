import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/user/lookup-account?accountNumber=9012345678
 *
 * Looks up a PayPilot Escrow Account Number and returns the owner's
 * full name and user_id for escrow confirmation.
 * Never exposes sensitive data (balance, email, bank details).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('accountNumber')?.trim();

    if (!accountNumber) {
      return NextResponse.json({ error: 'accountNumber is required' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { found: false, error: 'PayPilot account numbers are exactly 10 digits.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    // Find wallet by account number
    const { data: wallet, error: walletError } = await adminSupabase
      .from('wallets')
      .select('user_id, paypilot_account_number, status')
      .eq('paypilot_account_number', accountNumber)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ found: false });
    }

    if (wallet.status !== 'active') {
      return NextResponse.json({ found: false, error: 'This account is not active.' });
    }

    // Fetch owner name from profiles (safe — no sensitive fields)
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', wallet.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      user_id: profile.id,
      full_name: profile.full_name || 'PayPilot User',
      paypilot_account_number: wallet.paypilot_account_number,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}
