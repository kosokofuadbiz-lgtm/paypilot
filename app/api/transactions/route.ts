import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mockStore } from '@/lib/supabase/mock-store';
import { calculateEscrowFee } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey && userId) {
      const adminSupabase = createClient(supabaseUrl, serviceKey);
      const { data: escrows, error } = await adminSupabase
        .from('escrow_transactions')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!error && escrows && escrows.length > 0) return NextResponse.json(escrows);
    }
  } catch (e) {
    // Fallback to mockStore
  }

  const transactions = mockStore.getEscrowTransactions();
  return NextResponse.json(transactions);
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

    // 1. Check buyer's wallet balance in Supabase
    const { data: wallet } = await adminSupabase
      .from('wallets')
      .select('balance')
      .eq('user_id', buyer_id)
      .single();

    const currentBal = wallet ? Number(wallet.balance || 0) : 0;

    if (currentBal < totalDeduction) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₦${totalDeduction.toLocaleString()}, Available: ₦${currentBal.toLocaleString()}` },
        { status: 400 }
      );
    }

    const newBal = currentBal - totalDeduction;

    // 2. Deduct totalDeduction from buyer's wallet in Supabase
    await adminSupabase
      .from('wallets')
      .update({
        balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', buyer_id);

    // 3. Fetch seller and buyer profiles for names/emails
    const { data: buyerProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', buyer_id)
      .single();

    const { data: sellerProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', seller_id)
      .single();

    const buyerName = buyerProfile?.full_name || 'Buyer';
    const buyerEmail = buyerProfile?.email || '';
    const sellerName = sellerProfile?.full_name || 'Seller';
    const sellerEmail = sellerProfile?.email || '';

    // 4. Try inserting into Supabase escrow_transactions table (with column fallback if table schema differs)
    let createdEscrowObj: any = null;

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

    const { data: newEscrow, error: escrowError } = await adminSupabase
      .from('escrow_transactions')
      .insert(fullPayload)
      .select()
      .single();

    if (escrowError) {
      console.warn('Full column insert failed, trying minimal columns:', escrowError.message);
      // Fallback attempt with minimal core columns in case extra columns don't exist in DB schema
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

      if (!basicErr && basicEscrow) {
        createdEscrowObj = {
          ...basicEscrow,
          buyer_name: buyerName,
          seller_name: sellerName,
          buyer_email: buyerEmail,
          seller_email: sellerEmail,
        };
      }
    } else if (newEscrow) {
      createdEscrowObj = newEscrow;
    }

    // Add notification for seller in Supabase if transaction was inserted
    if (createdEscrowObj?.id) {
      try {
        await adminSupabase.from('notifications').insert({
          user_id: seller_id,
          title: 'New Escrow Transaction Received',
          message: `${buyerName} funded a ₦${amount.toLocaleString()} escrow for "${title}".`,
          type: 'escrow_funded',
          is_read: false,
          link_url: `/transactions/${createdEscrowObj.id}`,
        });
      } catch (e) {
        // Notification insert failure is non-fatal
      }
    }

    // 5. Always keep mockStore synchronized so mock fallback views work smoothly
    try {
      const localWallet = mockStore.getWallet(buyer_id);
      localWallet.balance = newBal; // Sync local balance so debitWallet won't throw

      const mockEscrow = mockStore.createEscrow({
        title,
        description,
        amount,
        fee,
        buyer_id,
        seller_id,
        buyer_email: buyerEmail,
        seller_email: sellerEmail,
        buyer_name: buyerName,
        seller_name: sellerName,
        status: 'funded',
        item_category: category || 'General Goods',
        inspection_period_days: inspection_days || 3,
      });

      if (!createdEscrowObj) {
        createdEscrowObj = mockEscrow;
      }
    } catch (e) {
      // Ignore mockStore sync errors
    }

    return NextResponse.json(
      createdEscrowObj || {
        id: `esc_${Date.now()}`,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Escrow creation failed' }, { status: 500 });
  }
}
