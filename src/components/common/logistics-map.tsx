"use client";

import { useState } from "react";
import {
  Layers3,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Satellite,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type LogisticsMapRouteKind =
  | "planned"
  | "completed"
  | "current"
  | "alternative"
  | "risk";

export type LogisticsMapRoute = {
  id: string;
  label: string;
  path: string;
  kind: LogisticsMapRouteKind;
  layer?: "traffic" | "restrictions";
};

export type LogisticsMapMarker = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  tone: "origin" | "current" | "destination" | "alert";
  shipmentId?: string;
};

const routeStyles: Record<
  LogisticsMapRouteKind,
  { stroke: string; dash?: string }
> = {
  planned: { stroke: "#94a3b8", dash: "10 9" },
  completed: { stroke: "#20b982" },
  current: { stroke: "#2f74ff" },
  alternative: { stroke: "#7867f2", dash: "8 8" },
  risk: { stroke: "#f59e0b", dash: "10 8" },
};

const markerStyles = {
  origin: "border-white bg-emerald-500 text-white",
  current: "border-white bg-blue-600 text-white",
  destination: "border-white bg-slate-400 text-white",
  alert: "border-white bg-amber-500 text-white",
} as const;

export function LogisticsMap({
  routes,
  markers,
  selectedRouteId,
  selectedMarkerId,
  onMarkerSelect,
  unavailable = false,
  loading = false,
  onRetry,
  className,
  children,
}: {
  routes: LogisticsMapRoute[];
  markers: LogisticsMapMarker[];
  selectedRouteId?: string;
  selectedMarkerId?: string;
  onMarkerSelect?: (markerId: string) => void;
  unavailable?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [zoom, setZoom] = useState(100);
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [restrictionsVisible, setRestrictionsVisible] = useState(true);
  const selectedMarker = markers.find(
    (marker) => marker.id === selectedMarkerId,
  );
  const visibleRoutes = routes.filter(
    (route) =>
      (!route.layer || route.layer !== "traffic" || trafficVisible) &&
      (!route.layer || route.layer !== "restrictions" || restrictionsVisible),
  );

  if (loading) {
    return (
      <div
        className={cn(
          "relative grid min-h-80 place-items-center overflow-hidden rounded-xl border border-sky-100 bg-[#dcefff] p-6 text-center",
          className,
        )}
      >
        <div className="max-w-sm space-y-3 rounded-xl border border-white/80 bg-white/90 p-5 shadow-sm">
          <LoaderCircle className="mx-auto size-7 animate-spin text-primary" />
          <p className="font-semibold">Loading map context</p>
          <p className="text-sm text-muted-foreground">
            Shipment and route context remains available while the local map
            fixture is prepared.
          </p>
        </div>
        {children}
      </div>
    );
  }

  if (unavailable) {
    return (
      <div
        className={cn(
          "relative grid min-h-80 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-slate-50 p-6 text-center",
          className,
        )}
      >
        <div className="max-w-sm space-y-3">
          <Satellite className="mx-auto size-7 text-slate-400" />
          <p className="font-semibold">Map tiles unavailable</p>
          <p className="text-sm text-muted-foreground">
            Shipment context is preserved. Retry the local map fixture when the
            connection is available.
          </p>
          {onRetry && (
            <Button type="button" variant="outline" onClick={onRetry}>
              <RefreshCw className="size-4" />
              Retry map
            </Button>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-80 overflow-hidden rounded-xl border border-sky-100 bg-[#dcefff]",
        className,
      )}
      aria-label="Interactive shipment GPS map"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(75,139,192,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(75,139,192,0.12)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        <svg
          viewBox="0 0 800 440"
          className="absolute inset-0 size-full"
          role="group"
          aria-label="Shipment routes between origin, current GPS position and destination"
        >
          <path
            d="M0 110 C125 55 260 155 390 105 C520 55 600 25 800 92 L800 440 L0 440 Z"
            fill="#f8fafc"
          />
          {visibleRoutes.map((route) => {
            const style = routeStyles[route.kind];
            const selected = route.id === selectedRouteId;
            return (
              <path
                key={route.id}
                d={route.path}
                fill="none"
                stroke={style.stroke}
                strokeDasharray={style.dash}
                strokeLinecap="round"
                strokeWidth={selected ? 7 : route.kind === "planned" ? 5 : 4}
                opacity={selected || !selectedRouteId ? 1 : 0.5}
                className={cn("transition-[opacity,stroke-width] duration-200")}
              >
                <title>{route.label}</title>
              </path>
            );
          })}
        </svg>

        {markers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          const markerClassName = cn(
            "absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 shadow-sm transition-transform",
            markerStyles[marker.tone],
            onMarkerSelect &&
              "hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200",
            selected && "scale-125 ring-4 ring-blue-200",
          );
          const markerStyle = {
            left: `${marker.x}%`,
            top: `${marker.y}%`,
          };
          const markerIcon =
            marker.tone === "current" ? (
              <Navigation className="size-3" />
            ) : (
              <MapPin className="size-3" />
            );

          return onMarkerSelect ? (
            <button
              key={marker.id}
              type="button"
              aria-label={`${marker.label}: ${marker.detail}`}
              aria-pressed={selected}
              onClick={() => onMarkerSelect(marker.id)}
              className={markerClassName}
              style={markerStyle}
            >
              {markerIcon}
            </button>
          ) : (
            <span
              key={marker.id}
              role="img"
              aria-label={`${marker.label}: ${marker.detail}`}
              className={markerClassName}
              style={markerStyle}
            >
              {markerIcon}
            </span>
          );
        })}

        {selectedMarker && (
          <div
            className="absolute z-20 w-52 -translate-x-1/2 rounded-lg border border-border bg-white p-3 shadow-lg"
            style={{
              left: `${Math.min(78, Math.max(22, selectedMarker.x))}%`,
              top: `${Math.max(5, selectedMarker.y - 28)}%`,
            }}
          >
            <p className="text-sm font-semibold">{selectedMarker.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedMarker.detail}
            </p>
            {selectedMarker.shipmentId && (
              <p className="mt-2 text-xs font-medium text-primary">
                {selectedMarker.shipmentId}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label="Traffic layer"
          aria-pressed={trafficVisible}
          onClick={() => setTrafficVisible((visible) => !visible)}
          className="bg-white/95"
        >
          <Layers3 className="size-3.5" />
          Traffic
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label="Restrictions layer"
          aria-pressed={restrictionsVisible}
          onClick={() => setRestrictionsVisible((visible) => !visible)}
          className="bg-white/95"
        >
          Restrictions
        </Button>
      </div>

      <div className="absolute bottom-3 right-3 z-30 flex items-center rounded-lg border border-border bg-white/95 p-1 shadow-sm">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Zoom out"
          disabled={zoom === 75}
          onClick={() => setZoom((value) => Math.max(75, value - 25))}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Reset map view"
          onClick={() => setZoom(100)}
        >
          <LocateFixed />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Zoom in"
          disabled={zoom === 150}
          onClick={() => setZoom((value) => Math.min(150, value + 25))}
        >
          <Plus />
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        Map zoom {zoom}%
      </p>

      {children}
    </div>
  );
}
