"use client";

import type { GeoResult } from "@/lib/types";
import { IconMap } from "@/components/v2/ui/Icons";

export function MapPart({ data }: { data: GeoResult }) {
  const points = data.features.filter(f => f.geometry.type === "Point").length;
  return (
    <div className="my-3 overflow-hidden rounded-xl v2-fade-up" style={{ border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-sm)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--ci-bg-wash)", borderBottom: "1px solid var(--ci-border)" }}>
        <IconMap className="h-3.5 w-3.5" style={{ color: "var(--ci-warning)" }} />
        <span className="text-[11px] font-semibold" style={{ color: "var(--ci-text-secondary)" }}>Map View</span>
        <span className="ml-auto text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>{data.features.length} features</span>
      </div>
      <div className="relative h-52 overflow-hidden" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 50%, #FFFBEB 100%)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(60,76,115,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(60,76,115,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {data.features.slice(0, 8).map((_, i) => { const a = (i / 8) * Math.PI * 2; const r = 40 + Math.random() * 50; return <div key={i} className="absolute h-3 w-3 rounded-full" style={{ background: "var(--ci-navy)", boxShadow: "0 0 8px rgba(60,76,115,0.3)", left: `calc(50% + ${Math.cos(a) * r}px)`, top: `calc(50% + ${Math.sin(a) * r}px)` }} />; })}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <IconMap className="h-8 w-8 mb-1" style={{ color: "var(--ci-navy)", opacity: 0.3 }} />
          <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text-secondary)" }}>{points} locations</p>
          <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>Interactive map requires maplibre-gl</p>
        </div>
      </div>
    </div>
  );
}
