import { mockStore } from './supabase/mock-store';
import { UserRole } from './types';

export function checkIsAdmin(userOrRole?: { role?: UserRole } | string | null): boolean {
  if (!userOrRole) {
    const current = mockStore.getCurrentUser();
    return current?.role === 'admin';
  }

  if (typeof userOrRole === 'string') {
    return userOrRole === 'admin';
  }

  return userOrRole.role === 'admin';
}
