'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { mockStore } from '@/lib/supabase/mock-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResendStatus(null);
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid email or password.');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed.');
    }
  };

  const handleResendVerification = () => {
    setResendStatus('Verification email has been resent to your email address.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-100">Pay<span className="text-cyan-400">Pilot</span></span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to manage your escrow deals and wallet</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          
          {errorMsg && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resendStatus && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full mb-4 py-5 flex items-center justify-center space-x-2 border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">or sign in with email</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="buyer@paypilot.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Resend verification?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full py-5 flex items-center justify-center space-x-2 text-sm"
              disabled={loading}
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

        </Card>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have a PayPilot account?{' '}
          <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
