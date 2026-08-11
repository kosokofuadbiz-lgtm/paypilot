import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mockStore } from './mock-store'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key && url !== 'https://your-supabase-url.supabase.co') {
    return createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )
  }

  // Graceful Mock Server Client
  return {
    auth: {
      async getUser() {
        const p = mockStore.getCurrentUser();
        return { data: { user: { id: p.id, email: p.email, user_metadata: { full_name: p.full_name } } }, error: null };
      }
    }
  } as any;
}
