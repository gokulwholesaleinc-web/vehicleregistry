import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-2 py-1 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap"
    >
      {label}
    </a>
  );
}

function AdminChip() {
  return (
    <a
      href="/admin"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
      data-testid="link-admin-chip"
    >
      {/* shield icon */}
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z"/></svg>
      <span className="hidden sm:inline">Admin</span>
    </a>
  );
}

interface AppHeaderProps {
  unread?: number;
  onAddEntry?: () => void;
  showWordmark?: boolean;
}

export default function AppHeader({ unread = 0, onAddEntry, showWordmark = false }: AppHeaderProps) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Close mobile menu on resize up
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-14 flex items-center gap-3">
          {/* Brand (compact): show only logo by default, optional wordmark on md+ */}
          <a href="/dashboard" aria-label="VINtage Garage" className="flex items-center gap-2">
            <img src="/vintage-badge.png" alt="VINtage Garage" className="h-7 w-7"/>
            {showWordmark && (
              <span className="hidden md:inline font-semibold tracking-tight text-slate-900">
                VINtage<span className="text-amber-500">Garage</span>
              </span>
            )}
          </a>

          {/* Primary nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-3">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/vehicles" label="Vehicles" />
            <NavLink href="/maintenance" label="Maintenance" />
            <NavLink href="/showcase" label="Showcase" />
            <NavLink href="/modifications" label="Modifications" />
            <NavLink href="/community" label="Community" />
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search (optional, collapses on <md) */}
          <div className="hidden md:flex items-center">
            <label className="relative">
              <input
                placeholder="Search VIN or build…"
                className="w-64 lg:w-72 rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.6-4.4a6 6 0 11-12 0 6 6 0 0112 0z"/>
              </svg>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-2">
            <button 
              onClick={onAddEntry}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800"
              data-testid="button-add-entry"
            >
              <span className="-ml-1 inline-block h-5 w-5 rounded-full bg-white/10 grid place-items-center">+</span>
              Add Entry
            </button>

            {/* Notifications */}
            <a href="/notifications" className="relative inline-grid place-items-center h-9 w-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" data-testid="link-notifications">
              <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7v3.586l-1.707 1.707A1 1 0 004 16h16a1 1 0 00.707-1.707L19 12.586V9a7 7 0 00-7-7zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center">{unread > 99 ? '99+' : unread}</span>
              )}
            </a>

            {/* Admin as its own chip */}
            {user?.role === 'admin' && <AdminChip />}

            {/* Profile dropdown (simple link for now) */}
            <a href="/profile" className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50" data-testid="link-profile">
              <img src="/vintage-badge.png" alt="Logo" className="h-5 w-5 rounded"/>
              <span className="hidden sm:inline text-sm font-medium text-slate-700">
                {user?.firstName || 'Account'}
              </span>
            </a>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setOpen(v => !v)} 
              className="lg:hidden inline-grid place-items-center h-9 w-9 rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {open && (
          <div className="lg:hidden pb-3">
            <nav className="grid gap-1">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/vehicles" label="Vehicles" />
              <NavLink href="/maintenance" label="Maintenance" />
              <NavLink href="/showcase" label="Showcase" />
              <NavLink href="/modifications" label="Modifications" />
              <NavLink href="/community" label="Community" />
              <button 
                onClick={onAddEntry}
                className="mt-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold text-left"
                data-testid="button-mobile-add-entry"
              >
                Add Entry
              </button>
              {user?.role === 'admin' && (
                <a href="/admin" className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700" data-testid="link-mobile-admin">
                  Admin
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}