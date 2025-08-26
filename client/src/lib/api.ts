// --- Single source of truth for API base ---
// Always prefer same-origin. Ignore envs that point to localhost or a different origin.

function safeBase(): string {
  const sameOrigin = `${location.origin}/api/v1`;
  const env = (import.meta.env as any)?.VITE_API_BASE?.trim();
  if (!env) return sameOrigin;

  // If someone set VITE_API_BASE to localhost, ignore it in the browser
  if (env.startsWith('http://localhost')) return sameOrigin;

  // If it's relative, treat as same-origin
  if (env.startsWith('/')) return `${location.origin}${env}`;

  // If absolute but not same-origin, ignore (prevents CSP breakage)
  try {
    const envOrigin = new URL(env).origin;
    if (envOrigin !== location.origin) return sameOrigin;
  } catch {
    return sameOrigin;
  }
  return env;
}

export const API_BASE = safeBase();

export function getToken(){ return localStorage.getItem('vg.jwt'); }
export function setToken(t: string | null){ if (t) localStorage.setItem('vg.jwt', t); else localStorage.removeItem('vg.jwt'); }

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type','application/json');
  const t = getToken(); if (t) headers.set('Authorization', `Bearer ${t}`);

  const url = `${API_BASE}${path}`; // path like '/vin/decode'
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  const json = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
  return json;
}

// Debug: confirm in console this is not localhost
if (typeof window !== 'undefined') console.info('[VG] API_BASE =', API_BASE);