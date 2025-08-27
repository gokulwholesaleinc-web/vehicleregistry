import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type BannerKind = "info" | "success" | "warning" | "error";
export type BannerMsg = { id: string; kind: BannerKind; text: string; sticky?: boolean; ttlMs?: number };

type Ctx = {
  banners: BannerMsg[];
  show: (m: Omit<BannerMsg, "id"> & { id?: string }) => string; // returns id
  hide: (id: string) => void;
  clear: () => void;
};

const BannerCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "vg.globalBanner";

export const BannerProvider: React.FC<{ children: React.ReactNode; persist?: boolean }>
= ({ children, persist = true }) => {
  const [banners, setBanners] = useState<BannerMsg[]>(() => {
    if (!persist) return [];
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (!persist) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(banners)); } catch {}
  }, [banners, persist]);

  // auto-expire non-sticky banners
  useEffect(() => {
    const timers = banners.map(b => {
      if (!b.ttlMs || b.sticky) return null;
      const t = setTimeout(() => setBanners(prev => prev.filter(x => x.id !== b.id)), b.ttlMs);
      return t;
    }).filter(Boolean) as NodeJS.Timeout[];
    return () => { timers.forEach(clearTimeout); };
  }, [banners]);

  const show: Ctx["show"] = useCallback((m) => {
    const id = m.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    setBanners(prev => [{ id, kind: m.kind, text: m.text, sticky: m.sticky, ttlMs: m.ttlMs ?? 6000 }, ...prev]);
    return id;
  }, []);

  const hide = useCallback((id: string) => setBanners(prev => prev.filter(b => b.id !== id)), []);
  const clear = useCallback(() => setBanners([]), []);

  const value = useMemo(() => ({ banners, show, hide, clear }), [banners, show, hide, clear]);

  return <BannerCtx.Provider value={value}>{children}</BannerCtx.Provider>;
};

export function useBanner() {
  const ctx = useContext(BannerCtx);
  if (!ctx) throw new Error("useBanner must be used within BannerProvider");
  return ctx;
}