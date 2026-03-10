"use client";

import type { GeoResult } from "@/lib/types";

interface MapPartProps {
  data: GeoResult;
}

export function MapPart({ data }: MapPartProps) {
  // Placeholder map visualization - would use maplibre-gl in production
  const pointCount = data.features.filter((f) => f.geometry.type === "Point").length;

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Map pins visualization */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {pointCount} location{pointCount !== 1 ? "s" : ""} found
          </p>
          <p className="text-xs text-zinc-500">Interactive map requires maplibre-gl</p>
        </div>

        {/* Decorative dots representing locations */}
        {data.features.slice(0, 8).map((feature, i) => {
          const angle = (i / Math.min(data.features.length, 8)) * Math.PI * 2;
          const radius = 60 + Math.random() * 40;
          return (
            <div
              key={i}
              className="absolute h-2.5 w-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"
              style={{
                left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                top: `calc(50% + ${Math.sin(angle) * radius}px)`,
              }}
              title={String(feature.properties?.name ?? `Location ${i + 1}`)}
            />
          );
        })}
      </div>
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50">
        {data.features.length} features in dataset
      </div>
    </div>
  );
}
