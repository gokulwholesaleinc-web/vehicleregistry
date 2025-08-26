import { useEffect, useState } from "react";
import BellDropdown from "@/features/notifications/BellDropdown";
import { SearchBar } from "./search-bar";
import AddEntryModal from "./add-entry-modal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const [addEntryModalOpen, setAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"modification" | "maintenance">("modification");
  
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Get user's vehicles to use for the modal
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/v1/vehicles"],
    queryFn: () => api("/vehicles").then(r => r.data),
  });

  const defaultVehicleId = vehicles.length > 0 ? vehicles[0].id : null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-14 flex items-center gap-3">
          {/* Brand: square logo, no squish */}
          <a href="/dashboard" aria-label="VINtage Garage" className="flex items-center gap-2">
            <img
              src="/vintage-badge.png"
              alt="VINtage Garage"
              className="h-7 w-7 shrink-0 object-contain"
              style={{ aspectRatio: '1 / 1' }}
            />
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

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center">
            <SearchBar />
          </div>

          {/* Actions (single Admin chip) */}
          <div className="flex items-center gap-2 ml-2">
            <button 
              onClick={() => setAddEntryModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800"
              data-testid="button-add-entry-header"
            >
              <span className="-ml-1 inline-block h-5 w-5 rounded-full bg-white/10 grid place-items-center">+</span>
              Add Entry
            </button>

            <BellDropdown />

            {/* The ONLY Admin button */}
            <a href="/admin" className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 whitespace-nowrap">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z"/></svg>
              <span>Admin</span>
            </a>

            <button onClick={() => setOpen(v => !v)} aria-label="Open menu" className="lg:hidden inline-grid place-items-center h-9 w-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50">
              <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>

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
                onClick={() => setAddEntryModalOpen(true)}
                className="mt-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                data-testid="button-add-entry-mobile"
              >
                Add Entry
              </button>
              <a href="/notifications" className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700">Notifications</a>
              <a href="/admin" className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700">Admin</a>
            </nav>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {defaultVehicleId && (
        <AddEntryModal
          isOpen={addEntryModalOpen}
          onClose={() => setAddEntryModalOpen(false)}
          vehicleId={defaultVehicleId}
          entryType={entryType}
          onEntryTypeChange={setEntryType}
        />
      )}
    </header>
  );
}