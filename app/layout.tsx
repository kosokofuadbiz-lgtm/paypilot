import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'PayPilot — Safe Escrow Payments for Nigeria',
  description: 'Protect your funds between buyers and sellers with PayPilot instant escrow and automated payouts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased custom-scrollbar">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
