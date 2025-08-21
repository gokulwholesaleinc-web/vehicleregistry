export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem("vg.jwt", token);
  else localStorage.removeItem("vg.jwt");
}

export function getAuthToken() {
  return localStorage.getItem("vg.jwt");
}

export async function api(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const baseUrl = window.location.origin; // Use current origin for API calls
  const res = await fetch(baseUrl + path, { ...init, headers });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export function logout() {
  setAuthToken(null);
  // Optionally call Google's disable auto-select
  if (window.google) {
    window.google.accounts.id.disableAutoSelect();
  }
  window.location.href = "/";
}