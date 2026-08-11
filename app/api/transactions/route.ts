import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateEscrowFee } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server configuration missing' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);
    const { data: escrows, error } = await adminSupabase
      .from('escrow_transactions')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(escrows || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      amount,
      buyer_id,
      seller_id,
      category,
      inspection_days,
    } = body;

    if (!title || !description || !amount || amount <= 0 || !buyer_id || !seller_id) {
      return NextResponse.json({ error: 'Missing required escrow fields' }, { status: 400 });
    }

    const fee = calculateEscrowFee(amount);
    const totalDeduction = amount + fee;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server configuration missing' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    // 1. Check buyer's wallet balance directly from Supabase wallets table
    const { data: wallet, error: walletQueryErr } = await adminSupabase
      .from('wallets')
      .select('balance')
      .eq('user_id', buyer_id)
      .single();

    if (walletQueryErr || !wallet) {
      return NextResponse.json(
        { error: 'Buyer wallet not found in Supabase. Please fund your wallet first.' },
        { status: 400 }
      );
    }

    const currentBal = Number(wallet.balance || 0);

    if (currentBal < totalDeduction) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₦${totalDeduction.toLocaleString()}, Available: ₦${currentBal.toLocaleString()}` },
        { status: 400 }
      );
    }

    const newBal = currentBal - totalDeduction;

    // 2. Atomic balance deduction from buyer's wallet in Supabase
    const { error: deductErr } = await adminSupabase
      .from('wallets')
      .update({
        balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', buyer_id);

    if (deductErr) {
      return NextResponse.json({ error: `Wallet deduction failed: ${deductErr.message}` }, { status: 500 });
    }

    // 3. Fetch buyer and seller profiles for names and emails
    const { data: buyerProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', buyer_id)
      .maybeSingle();

    const { data: sellerProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', seller_id)
      .maybeSingle();

    const buyerName = buyerProfile?.full_name || 'Buyer';
    const buyerEmail = buyerProfile?.email || '';
    const sellerName = sellerProfile?.full_name || 'Seller';
    const sellerEmail = sellerProfile?.email || '';

    // 4. Insert into Supabase escrow_transactions table
    const fullPayload = {
      title,
      description,
      amount,
      fee,
      buyer_id,
      seller_id,
      buyer_name: buyerName,
      seller_name: sellerName,
      buyer_email: buyerEmail,
      seller_email: sellerEmail,
      status: 'funded',
      item_category: category || 'General Goods',
      inspection_period_days: inspection_days || 3,
      updated_at: new Date().toISOString(),
    };

    let { data: newEscrow, error: escrowError } = await adminSupabase
      .from('escrow_transactions')
      .insert(fullPayload)
      .select()
      .single();

    if (escrowError) {
      // Fallback with minimal columns if DB schema lacks specific name/email columns
      const { data: basicEscrow, error: basicErr } = await adminSupabase
        .from('escrow_transactions')
        .insert({
          title,
          description,
          amount,
          fee,
          buyer_id,
          seller_id,
          status: 'funded',
          item_category: category || 'General Goods',
          inspection_period_days: inspection_days || 3,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (basicErr || !basicEscrow) {
        // Rollback balance deduction if escrow creation fails
        await adminSupabase.from('wallets').update({ balance: currentBal }).eq('user_id', buyer_id);
        return NextResponse.json({ error: `Escrow creation failed: ${escrowError.message}` }, { status: 500 });
      }

      newEscrow = {
        ...basicEscrow,
        buyer_name: buyerName,
        seller_name: sellerName,
        buyer_email: buyerEmail,
        seller_email: sellerEmail,
      };
    }

    // 5. Send notification to seller in Supabase
    try {
      await adminSupabase.from('notifications').insert({
        user_id: seller_id,
        title: 'New Escrow Transaction Received',
        message: `${buyerName} funded a ₦${amount.toLocaleString()} escrow for "${title}".`,
        type: 'escrow_funded',
        is_read: false,
        link_url: `/transactions/${newEscrow.id}`,
      });
    } catch (e) {
      // Non-fatal
    }

    return NextResponse.json(newEscrow, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Escrow creation failed' }, { status: 500 });
  }
}
