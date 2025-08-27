import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Vehicle } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2, Search, Car } from "lucide-react";

interface SearchResult {
  vehicles: Vehicle[];
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/v1/search", query],
    queryFn: () => api(`/api/v1/search?q=${encodeURIComponent(query)}`).then(r => r),
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (vehicle: Vehicle) => {
    setQuery("");
    setIsOpen(false);
    setLocation(`/vehicles/${vehicle.id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  return (
    <div ref={searchRef} className="relative">
      <label className="relative">
        <input
          type="text"
          placeholder="Search VIN or build…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-64 lg:w-72 rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          data-testid="input-search"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </label>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : searchResults?.vehicles?.length ? (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Vehicles ({searchResults.vehicles.length})
              </div>
              {searchResults.vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleResultClick(vehicle)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  data-testid={`search-result-${vehicle.id}`}
                >
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Car className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {vehicle.vin ? `VIN: ${vehicle.vin}` : 'Draft Vehicle'}
                      {vehicle.trim && ` • ${vehicle.trim}`}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {vehicle.isPublic ? 'Public' : 'Private'}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-slate-500">
              <Car className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <div className="text-sm">No vehicles found</div>
              <div className="text-xs text-slate-400">Try searching by VIN, make, model, or year</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}