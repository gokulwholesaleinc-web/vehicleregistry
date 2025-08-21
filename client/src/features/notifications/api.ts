import { queryClient } from '@/lib/queryClient';

const API_BASE = '/api/v1/notifications';

export async function listNotifications(cursor?: string) {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const response = await fetch(`${API_BASE}${q}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }
  
  return response.json();
}

export async function unreadCount() {
  const response = await fetch(`${API_BASE}/unread/count`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch unread count: ${response.statusText}`);
  }
  
  return response.json();
}

export async function markRead(ids: string[]) {
  const response = await fetch(`${API_BASE}/read`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark as read: ${response.statusText}`);
  }
  
  return response.json();
}