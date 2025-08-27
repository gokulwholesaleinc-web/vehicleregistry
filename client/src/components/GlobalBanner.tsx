import React from "react";
import { useBanner } from "../providers/BannerProvider";

const KIND_CLASSES: Record<string, string> = {
  info: "bg-blue-50 text-blue-900 border-blue-200",
  success: "bg-green-50 text-green-900 border-green-200",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
  error: "bg-red-50 text-red-900 border-red-200",
};

export default function GlobalBanner() {
  const { banners, hide } = useBanner();
  if (!banners.length) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-6xl p-3 space-y-2">
        {banners.map(b => (
          <div key={b.id} className={`pointer-events-auto border rounded-lg p-3 shadow ${KIND_CLASSES[b.kind] || KIND_CLASSES.info}`}>
            <div className="flex items-start gap-3">
              <div className="font-medium capitalize">{b.kind}</div>
              <div className="flex-1 text-sm">{b.text}</div>
              <button className="text-sm underline" onClick={() => hide(b.id)}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}