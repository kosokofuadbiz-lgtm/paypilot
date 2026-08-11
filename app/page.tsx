import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, ArrowRight, CheckCircle2, Zap, 
  RefreshCw, Scale, CreditCard, ChevronRight, UserCheck, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="h-7 w-7 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-100">Pay<span className="text-cyan-400">Pilot</span></span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-cyan-300">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="gradient" className="shadow-lg shadow-cyan-500/20">
                Get Started
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow backdrop graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-8 backdrop-blur-md">
            <Shield className="h-4 w-4" />
            <span>Nigeria&apos;s Preferred Escrow Platform for Buyer & Seller Protection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
            Never Get Scammed Online Again. <br className="hidden sm:inline" />
            <span className="text-gradient">Escrow Payments Made Simple.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-slate-400 leading-relaxed">
            PayPilot holds transaction funds securely in middleman escrow. Buyers only release money when goods arrive, and sellers ship with confidence knowing funds are locked.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl flex items-center justify-center space-x-2">
                <span>Launch Escrow Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-slate-800 bg-slate-900/60 hover:bg-slate-800">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Key Stat Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-md">
              <p className="text-2xl font-extrabold text-cyan-400">₦250M+</p>
              <p className="text-xs text-slate-400 mt-1">Escrow Volume Protected</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-md">
              <p className="text-2xl font-extrabold text-emerald-400">99.8%</p>
              <p className="text-xs text-slate-400 mt-1">Successful Deal Completion</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-md">
              <p className="text-2xl font-extrabold text-cyan-400">Paystack</p>
              <p className="text-xs text-slate-400 mt-1">Instant Bank Funding & Payout</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-md">
              <p className="text-2xl font-extrabold text-purple-400">24/7</p>
              <p className="text-xs text-slate-400 mt-1">Dispute Resolution Support</p>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">How PayPilot Escrow Works</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Three transparent steps to complete peer-to-peer deals with total peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl hover:border-cyan-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-extrabold text-xl mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-100">Create & Fund Escrow</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Buyer creates an escrow deal, specifies inspection terms, and locks funds into PayPilot middleman vault.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl hover:border-cyan-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-extrabold text-xl mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-100">Seller Delivers Items</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Seller sees funds locked securely and ships items or delivers professional work directly to the buyer.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl hover:border-emerald-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-xl mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-100">Inspect & Release Funds</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Buyer inspects item and clicks &quot;Release Funds&quot;. Money transfers instantly into the seller&apos;s bank wallet.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">Built for Nigerian Commerce</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Tailored features to protect Instagram vendors, freelance developers, gadget traders, and online buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Secure Escrow Vault</h4>
              <p className="text-xs text-slate-400 mt-1">Funds remain untouched in middleman hold until buyer explicitly confirms receipt.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Paystack Integration</h4>
              <p className="text-xs text-slate-400 mt-1">Instant wallet funding and bank payout transfers across all Nigerian financial institutions.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Dispute Mediation</h4>
              <p className="text-xs text-slate-400 mt-1">Fair arbitration team investigates proof of delivery or item defect claims before fund release.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Verified Profiles</h4>
              <p className="text-xs text-slate-400 mt-1">Bank details and identity confirmation gate withdrawals for total accountability.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Instant Notifications</h4>
              <p className="text-xs text-slate-400 mt-1">Real-time alerts via inbox and email on goods sent, funds released, and payout status.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Low 1.5% Fee</h4>
              <p className="text-xs text-slate-400 mt-1">Transparent 1.5% escrow fee capped at ₦2,000 maximum per transaction.</p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span className="font-bold text-slate-300">PayPilot Escrow Nigeria</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/auth/login" className="hover:text-slate-300">Sign In</Link>
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/admin" className="hover:text-purple-400">Admin Suite</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
