"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { CanvasBlock } from "@/lib/canvas-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Location {
  name: string;
  lat?: number;
  lng?: number;
  value?: number;
  label?: string;
}

interface MapData {
  mapType?: string;
  locations?: Location[];
  center?: [number, number] | { lat: number; lng: number };
  zoom?: number;
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton shown while the dynamic import resolves           */
/* ------------------------------------------------------------------ */

function MapSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        height: 320,
        background: "var(--ci-bg-surface, #f8f9fb)",
        border: "1px solid var(--ci-border, #e2e5ec)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ci-text-muted, #9ca3af)",
        fontSize: 13,
        fontWeight: 500,
        gap: 8,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.5 }}
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      Loading map…
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic import – react-leaflet accesses `window` so we must       */
/*  disable SSR entirely for the inner map component.                 */
/* ------------------------------------------------------------------ */

const MapInner = dynamic(
  () => import("./MapBlockInner").then((mod) => mod.MapBlockInner),
  { ssr: false, loading: () => <MapSkeleton /> },
);

/* ------------------------------------------------------------------ */
/*  Public MapBlock component                                          */
/* ------------------------------------------------------------------ */

export function MapBlock({ block }: { block: CanvasBlock }) {
  const mapData = (block.data as MapData | undefined) ?? {};

  const locations: Location[] = useMemo(
    () => mapData.locations ?? [],
    [mapData.locations],
  );

  // Normalize center: accept [lat, lng] array or {lat, lng} object
  const rawCenter = mapData.center;
  const center: [number, number] = Array.isArray(rawCenter)
    ? rawCenter
    : rawCenter && typeof rawCenter === "object" && "lat" in rawCenter
    ? [rawCenter.lat, rawCenter.lng]
    : [39.8283, -98.5795];
  const zoom: number = mapData.zoom ?? 4;

  const totalValue = useMemo(
    () => locations.reduce((sum, loc) => sum + (loc.value ?? 0), 0),
    [locations],
  );

  return (
    <div style={{ width: "100%" }}>
      {/* Map container */}
      <div
        style={{
          width: "100%",
          height: 320,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--ci-border, #e2e5ec)",
        }}
      >
        <MapInner locations={locations} center={center} zoom={zoom} />
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 8,
          padding: "8px 12px",
          borderRadius: 6,
          background: "var(--ci-bg-surface, #f8f9fb)",
          border: "1px solid var(--ci-border, #e2e5ec)",
          fontSize: 12,
          color: "var(--ci-text-secondary, #64748b)",
          fontWeight: 500,
        }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--ci-navy, #3C4C73)",
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          {locations.length} location{locations.length !== 1 ? "s" : ""}
        </span>
        <span
          style={{
            width: 1,
            height: 14,
            background: "var(--ci-border, #e2e5ec)",
          }}
        />
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--ci-coral, #CF384D)",
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          Total value:{" "}
          <span style={{ color: "var(--ci-text, #1e293b)", fontWeight: 600 }}>
            {totalValue.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}
