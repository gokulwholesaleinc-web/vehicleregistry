// Client API helper: prefixes /api/v1 for you. Always call api('/path', ...)
const base = (import.meta.env.VITE_API_BASE?.trim()) || `${location.origin}/api/v1`;

export function getToken() { 
  return localStorage.getItem('vg.jwt'); 
}

export function setToken(t: string | null) { 
  t ? localStorage.setItem('vg.jwt', t) : localStorage.removeItem('vg.jwt'); 
}

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const t = getToken(); if (t) headers.set('Authorization', `Bearer ${t}`);
  try {
    const res = await fetch(`${base}${path}`, { ...init, headers, mode: 'cors' });
    if (res.status === 401) { setToken(null); throw new Error('Your session expired. Please sign in again.'); }
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
    return json;
  } catch (err: any) {
    const msg = err?.message?.includes('Failed to fetch') ? 'Network error: API not reachable (CORS/base URL).' : (err?.message || 'Request failed');
    throw new Error(msg);
  }
}