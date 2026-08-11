import { createBrowserClient } from '@supabase/ssr'
import { mockStore } from './mock-store'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key && url !== 'https://your-supabase-url.supabase.co') {
    return createBrowserClient(url, key)
  }

  // Graceful Mock Supabase Client for offline / dev preview
  // Includes onAuthStateChange stub so AuthProvider doesn't crash
  return {
    auth: {
      async getUser() {
        const p = mockStore.getCurrentUser();
        return { data: { user: { id: p.id, email: p.email, user_metadata: { full_name: p.full_name } } }, error: null };
      },
      async getSession() {
        const p = mockStore.getCurrentUser();
        return { data: { session: { user: { id: p.id, email: p.email } } }, error: null };
      },
      async signInWithPassword({ email }: { email: string }) {
        const found = mockStore.getProfileByEmail(email);
        if (found) {
          mockStore.setCurrentUser(found.id);
          return { data: { user: { id: found.id, email: found.email } }, error: null };
        }
        return { data: null, error: { message: 'Invalid credentials. User not found.' } };
      },
      async signUp({ email, options }: { email: string; password?: string; options?: { data?: { full_name?: string } } }) {
        const fullName = options?.data?.full_name || email.split('@')[0];
        const newProf = mockStore.registerUser(email, fullName);
        return { data: { user: { id: newProf.id, email: newProf.email, user_metadata: { full_name: newProf.full_name } } }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      // Required by AuthProvider — returns a no-op unsubscribe
      onAuthStateChange(_callback: (event: string, session: any) => void) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    }
  } as any;
}
