import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase service role configuration is missing on the server' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, phone_number, role, real_bank_name, real_account_number, real_account_name')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: error?.message || 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase service role configuration is missing on the server' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const { data: existingProfile, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (fetchError || !existingProfile?.email) {
      return NextResponse.json(
        { error: 'Profile not found or email is missing. Please recreate the user profile.' },
        { status: 400 }
      );
    }

    const email = String(existingProfile.email).trim();

    if (!email) {
      return NextResponse.json({ error: 'Profile email cannot be empty' }, { status: 400 });
    }

    const { data: updated, error } = await adminSupabase
      .from('profiles')
      .update({
        ...data,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Profile update failed' }, { status: 500 });
    }

    return NextResponse.json({ profile: updated, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Profile update failed' }, { status: 500 });
  }
}
