import { mockStore } from './supabase/mock-store';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    status: string;
    reference: string;
    customer: {
      email: string;
    };
  };
}

export class PaystackService {
  private secretKey: string | undefined;
  public publicKey: string | undefined;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  }

  isMockMode(): boolean {
    return !this.secretKey || this.secretKey.includes('your_paystack');
  }

  async initializePayment(email: string, amountNGN: number, callbackUrl?: string): Promise<PaystackInitResponse> {
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const amountKobo = Math.round(amountNGN * 100);

    if (this.isMockMode()) {
      return {
        status: true,
        message: 'Mock payment authorization initialized',
        data: {
          authorization_url: `/dashboard?paystack_mock=true&reference=${reference}&amount=${amountNGN}`,
          access_code: `mock_code_${reference}`,
          reference
        }
      };
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        callback_url: callbackUrl,
        reference
      })
    });

    return response.json();
  }

  async verifyPayment(reference: string, amountNGN?: number): Promise<PaystackVerifyResponse> {
    if (this.isMockMode() || reference.startsWith('ref_')) {
      const resolvedAmount = amountNGN ? Math.round(amountNGN * 100) : 5000000;

      return {
        status: true,
        message: 'Mock verification successful',
        data: {
          amount: resolvedAmount,
          currency: 'NGN',
          status: 'success',
          reference,
          customer: {
            email: 'user@paypilot.ng'
          }
        }
      };
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`
      }
    });

    return response.json();
  }
}

export const paystack = new PaystackService();
