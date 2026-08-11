import { NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const { email, amount, userId } = await req.json();

    if (!email || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid user email and deposit amount are required' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    // Pass userId in callback so verify route can credit the right wallet
    const callbackUrl = `${protocol}://${host}/dashboard?paystack_verify=true&userId=${encodeURIComponent(userId || '')}&amount=${encodeURIComponent(amount)}`;

    const res = await paystack.initializePayment(email, amount, callbackUrl);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment initialization failed' }, { status: 500 });
  }
}
