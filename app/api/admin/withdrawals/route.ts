import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET() {
  const currentUser = mockStore.getCurrentUser();
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const withdrawals = mockStore.getWithdrawals();
  return NextResponse.json(withdrawals);
}

export async function POST(req: Request) {
  try {
    const currentUser = mockStore.getCurrentUser();
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { withdrawal_id, approve, rejection_reason } = await req.json();

    const processed = mockStore.processWithdrawal(withdrawal_id, approve, rejection_reason);
    return NextResponse.json(processed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Withdrawal processing failed' }, { status: 400 });
  }
}
