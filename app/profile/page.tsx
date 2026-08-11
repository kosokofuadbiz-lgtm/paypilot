'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation';
import { User, Building, Phone, Mail, CheckCircle2, ShieldCheck, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate form fields once profile loads from Supabase
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setBankName(profile.real_bank_name || '');
      setAccountNumber(profile.real_account_number || '');
      setAccountName(profile.real_account_name || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (accountNumber && (!/^\d{10}$/.test(accountNumber))) {
      setErrorMsg('Nigerian bank account number must be exactly 10 digits.');
      return;
    }

    if (!user?.id) {
      setErrorMsg('You must be logged in to update your profile.');
      return;
    }

    setSaving(true);

    try {
      // Save to Supabase via the profile API route (uses service role key)
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          real_bank_name: bankName,
          real_account_number: accountNumber,
          real_account_name: accountName || fullName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      // Refresh the profile in AuthContext so all components see the new data
      await refreshProfile();

      setSuccessMsg('Profile saved successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <User className="h-6 w-6 text-cyan-400" />
            <span>Profile &amp; Settlement Bank Account</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage your identity details and Nigerian bank account for escrow withdrawals</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl">
          
          {successMsg && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address (Read-only)</label>
                  <Input
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="bg-slate-950/40 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Phone Number (11 digits)</label>
                  <Input
                    placeholder="08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Bank Settlement Details */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-400" />
                <span>Nigerian Settlement Bank Account</span>
              </h3>
              <p className="text-xs text-slate-400">
                Withdrawals are transferred directly to this bank account via Paystack transfer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Bank Name</label>
                  <Select value={bankName} onChange={(e) => setBankName(e.target.value)}>
                    <option value="">Select your bank...</option>
                    <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay Digital Services</option>
                    <option value="Palmpay">Palmpay</option>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Account Number (10 Digits)</label>
                  <Input
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Account Name (As registered with bank)</label>
                  <Input
                    placeholder="e.g. Babatunde Olawale"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8"
              disabled={saving || authLoading}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></>
              ) : (
                <><Save className="h-4 w-4" /><span>Save Profile &amp; Bank Details</span></>
              )}
            </Button>

          </form>
        </Card>

      </main>
    </div>
  );
}
