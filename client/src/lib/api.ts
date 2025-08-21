const base = (import.meta.env.VITE_API_BASE?.trim()) || `${location.origin}/api/v1`;

export function getToken() { 
  return localStorage.getItem("vg.jwt"); 
}

export function setToken(token: string | null) { 
  if (token) {
    localStorage.setItem("vg.jwt", token);
  } else {
    localStorage.removeItem("vg.jwt");
  }
}

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  try {
    const res = await fetch(`${base}${path}`, { 
      ...init, 
      headers,
      mode: 'cors'
    });
    
    if (res.status === 401) {
      setToken(null);
      throw new Error("Your session expired. Please sign in again.");
    }
    
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.error?.message || json?.message || `HTTP ${res.status}`);
    }
    
    return json;
  } catch (err: any) {
    throw new Error(err?.message?.includes('Failed to fetch') || err?.name === 'TypeError'
      ? 'Network error: API not reachable (CORS/base URL).'
      : (err?.message || 'Request failed'));
  }
}