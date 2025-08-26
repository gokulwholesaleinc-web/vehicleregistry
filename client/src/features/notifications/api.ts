import { queryClient } from '@/lib/queryClient';
import { api } from '@/lib/api';

export async function listNotifications(cursor?: string) {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return await api(`/notifications${q}`);
}

export async function unreadCount() {
  return await api('/notifications/unread/count');
}

export async function markRead(ids: string[]) {
  return await api('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}