"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

interface MapBlockInnerProps {
  locations: Location[];
  center: [number, number];
  zoom: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Map a value to a circle radius between `minR` and `maxR`. */
function radiusForValue(
  value: number,
  minVal: number,
  maxVal: number,
  minR = 6,
  maxR = 22,
): number {
  if (maxVal === minVal) return (minR + maxR) / 2;
  const t = (value - minVal) / (maxVal - minVal);
  return minR + t * (maxR - minR);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MapBlockInner({
  locations,
  center,
  zoom,
}: MapBlockInnerProps) {
  // Filter to only locations with valid lat/lng
  const validLocations = useMemo(
    () => locations.filter((l) => typeof l.lat === "number" && typeof l.lng === "number" && isFinite(l.lat) && isFinite(l.lng)),
    [locations]
  );

  const { minVal, maxVal } = useMemo(() => {
    const vals = validLocations.map((l) => l.value ?? 0);
    if (vals.length === 0) return { minVal: 0, maxVal: 1 };
    return { minVal: Math.min(...vals), maxVal: Math.max(...vals) };
  }, [validLocations]);

  // Fallback center if provided center is invalid
  const safeCenter: [number, number] =
    typeof center[0] === "number" && typeof center[1] === "number" && isFinite(center[0]) && isFinite(center[1])
      ? center
      : validLocations.length > 0
      ? [validLocations[0].lat!, validLocations[0].lng!]
      : [39.8283, -98.5795]; // US center fallback

  return (
    <MapContainer
      center={safeCenter}
      zoom={zoom || 4}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
    >
      {/* CartoDB Positron – clean, light tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {validLocations.map((loc, idx) => {
        const r = radiusForValue(loc.value ?? 0, minVal, maxVal);
        return (
          <CircleMarker
            key={`${loc.name}-${idx}`}
            center={[loc.lat!, loc.lng!]}
            radius={r}
            pathOptions={{
              color: "#3C4C73",       /* --ci-navy */
              weight: 2,
              fillColor: "#CF384D",   /* --ci-coral */
              fillOpacity: 0.55,
            }}
          >
            <Popup>
              <div
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#1e293b",
                  minWidth: 120,
                }}
              >
                <strong style={{ fontSize: 14, color: "#3C4C73" }}>
                  {loc.name}
                </strong>
                {(loc.label || loc.value != null) && (
                  <>
                    <br />
                    {loc.label && <span style={{ color: "#64748b" }}>{loc.label}: </span>}
                    {loc.value != null && (
                      <span style={{ fontWeight: 600 }}>
                        {loc.value.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
