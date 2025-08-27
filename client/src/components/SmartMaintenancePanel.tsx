import React, { useEffect, useState } from "react";

export default function SmartMaintenancePanel({ vin, mileage }: { vin: string; mileage?: number }){
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string| null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vin || vin.length !== 17) return;
    let cancel = false;
    setLoading(true); setError(null);
    fetch(`/api/v1/maintenance/predict?vin=${vin}${mileage? `&mileage=${mileage}`:""}`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(j => { if (!cancel) setData(j); })
      .catch(e => { if (!cancel) setError(String(e)); })
      .finally(()=> { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [vin, mileage]);

  if (!vin) return <div className="text-sm opacity-70">Select a vehicle to view maintenance recommendations.</div>;
  if (loading) return <div className="animate-pulse text-sm">Loading smart maintenance…</div>;
  if (error) return <div className="text-sm text-red-600">{String(error).slice(0,180)}</div>;
  if (!data) return null;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Smart Maintenance</h3>
        <span className="text-xs opacity-60">source: {data.source || "unknown"}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {(data.items || []).map((it: any, i: number) => (
          <li key={i} className="border rounded p-2">
            <div className="font-medium">{it.title}</div>
            <div className="text-sm opacity-80">When: {it.when}</div>
            {it.reason && <div className="text-xs opacity-70">Why: {it.reason}</div>}
          </li>
        ))}
      </ul>
      {data.notes && <p className="text-xs opacity-70 mt-2">{data.notes}</p>}
    </div>
  );
}