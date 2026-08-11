import { mockStore } from './supabase/mock-store';
import { NotificationType } from './types';

export function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  linkUrl?: string
) {
  return mockStore.addNotification(userId, title, message, type, linkUrl);
}
