import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const adminSupabase = createClient(supabaseUrl, serviceKey);
      const { data: escrow } = await adminSupabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (escrow) {
        return NextResponse.json(escrow);
      }
    }

    // Fallback: search in mockStore
    const escrow = mockStore.getEscrowById(id);
    if (escrow) {
      return NextResponse.json(escrow);
    }
  } catch (e) {
    // Fallback to mockStore
  }

  const resolvedParams = await params;
  const escrow = mockStore.getEscrowById(resolvedParams.id);
  if (escrow) {
    return NextResponse.json(escrow);
  }

  return NextResponse.json({ error: 'Escrow transaction not found' }, { status: 404 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, userId } = body;

    if (!id || !action || !userId) {
      return NextResponse.json({ error: 'Missing required parameters (id, action, userId)' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server configuration missing' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch current transaction details from Supabase
    let { data: escrow } = await adminSupabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', id)
      .single();

    // Fallback to mockStore if not found in Supabase
    if (!escrow) {
      const local = mockStore.getEscrowById(id);
      if (local) escrow = local as any;
    }

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow transaction not found' }, { status: 404 });
    }

    // ── ACTION 1: Seller Marks Goods / Services Sent ──
    if (action === 'mark_goods_sent') {
      const newStatus = 'goods_sent';

      // Update Supabase
      await adminSupabase
        .from('escrow_transactions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      // Notify Buyer
      await adminSupabase.from('notifications').insert({
        user_id: escrow.buyer_id,
        title: 'Goods / Service Marked Sent',
        message: `${escrow.seller_name || 'Seller'} marked "${escrow.title}" as delivered. Please inspect and release funds.`,
        type: 'goods_sent',
        is_read: false,
        link_url: `/transactions/${id}`,
      });

      // Sync local mockStore
      try { mockStore.updateEscrowStatus(id, 'goods_sent', userId); } catch (e) {}

      return NextResponse.json({ success: true, status: 'goods_sent', message: 'Marked as delivered.' });
    }

    // ── ACTION 2: Buyer Releases Funds to Seller ──
    if (action === 'release_funds') {
      if (escrow.status === 'completed') {
        return NextResponse.json({ success: true, status: 'completed', message: 'Funds already released.' });
      }

      const releaseAmount = Number(escrow.amount || 0);

      // 1. Update escrow status to completed
      await adminSupabase
        .from('escrow_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      // 2. Credit Seller's wallet in Supabase
      if (escrow.seller_id && releaseAmount > 0) {
        const { data: sellerWallet } = await adminSupabase
          .from('wallets')
          .select('balance')
          .eq('user_id', escrow.seller_id)
          .single();

        const currentBal = sellerWallet ? Number(sellerWallet.balance || 0) : 0;
        const newBal = currentBal + releaseAmount;

        if (sellerWallet) {
          await adminSupabase
            .from('wallets')
            .update({ balance: newBal, updated_at: new Date().toISOString() })
            .eq('user_id', escrow.seller_id);
        } else {
          await adminSupabase
            .from('wallets')
            .insert({
              user_id: escrow.seller_id,
              balance: releaseAmount,
              held_balance: 0,
              currency: 'NGN',
              status: 'active',
              updated_at: new Date().toISOString()
            });
        }

        // Notify Seller
        await adminSupabase.from('notifications').insert({
          user_id: escrow.seller_id,
          title: 'Escrow Funds Released!',
          message: `₦${releaseAmount.toLocaleString()} released from escrow for "${escrow.title}" into your wallet balance.`,
          type: 'funds_released',
          is_read: false,
          link_url: `/transactions/${id}`,
        });
      }

      // Sync local mockStore
      try { mockStore.updateEscrowStatus(id, 'completed', userId); } catch (e) {}

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: `₦${releaseAmount.toLocaleString()} successfully released to seller's wallet!`
      });
    }

    return NextResponse.json({ error: 'Unknown action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
