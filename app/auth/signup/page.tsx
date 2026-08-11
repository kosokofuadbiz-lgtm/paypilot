'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<'check_email' | 'created' | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message || 'Failed to create account.');
    } else {
      if (data?.user) {
        // Use server-side API route (service role key) to reliably create
        // profile + wallet rows, bypassing Supabase RLS policies.
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email,
            fullName,
          }),
        });
      }
      setSuccessType('created');
    }
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
          <h1 className="text-xl font-bold text-slate-100">Create PayPilot Account</h1>
          <p className="text-xs text-slate-400">Join thousands of Nigerians transacting securely in escrow</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          
          {errorMsg && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successType ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-100">Account Created Successfully!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your PayPilot account is ready. Please log in with your credentials to set up your wallet and profile.
              </p>
              <Link href="/auth/login" className="w-full">
                <Button variant="gradient" className="w-full py-5 text-sm">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="e.g. Babatunde Olawale"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="name@domain.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Password</label>
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

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full py-5 flex items-center justify-center space-x-2 text-sm mt-2"
                disabled={loading}
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

        </Card>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Already have a PayPilot account?{' '}
          <Link href="/auth/login" className="text-cyan-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
