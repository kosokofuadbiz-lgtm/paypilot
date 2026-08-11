import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function POST(req: Request) {
  try {
    const { transaction_id } = await req.json();
    const currentUser = mockStore.getCurrentUser();

    const escrow = mockStore.getEscrowById(transaction_id);
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow transaction not found' }, { status: 404 });
    }

    if (escrow.buyer_id !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Only the buyer can release escrow funds.' }, { status: 403 });
    }

    if (escrow.status === 'completed') {
      return NextResponse.json({ error: 'Transaction has already been completed.' }, { status: 400 });
    }

    const updated = mockStore.updateEscrowStatus(transaction_id, 'completed', currentUser.id);

    return NextResponse.json({
      success: true,
      message: 'Escrow funds successfully released to seller wallet',
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Fund release failed' }, { status: 500 });
  }
}
