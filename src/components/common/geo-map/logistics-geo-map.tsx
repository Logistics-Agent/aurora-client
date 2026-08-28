"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { cn } from "@/lib/utils";
import {
  MAP_RUNTIME_CONFIG,
  MAP_STYLE_LOAD_TIMEOUT_MS,
  OPENFREEMAP_LITE_STYLE,
} from "./constants/map-config";
import { MapControls } from "./components/map-controls";
import {
  MapStatusOverlay,
  type MapRenderMode,
} from "./components/map-status-overlay";
import { SvgMapFallback } from "./components/svg-map-fallback";
import { useWebglCapability } from "./hooks/use-webgl-capability";
import type { LogisticsGeoMarker, LogisticsGeoRoute } from "./types";
import { getOperationalBounds } from "./utils/geojson";
import { loadMapLibre } from "./utils/load-maplibre";
import { getMapPitch } from "./utils/map-style";
import {
  addBuildingExtrusions,
  addTerrain,
  syncOperationalLayers,
} from "./utils/operational-layers";
import {
  canRenderShipmentModel,
  createShipmentModelLayer,
  SHIPMENT_MODEL_LAYER_ID,
} from "./utils/shipment-model-layer";

type LogisticsGeoMapProps = {
  routes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
  selectedRouteId?: string;
  selectedMarkerId?: string;
  onMarkerSelect?: (markerId: string) => void;
  loading?: boolean;
  unavailable?: boolean;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
};

function getResponsivePitch() {
  return getMapPitch(
    window.innerWidth,
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
}

export function LogisticsGeoMap(props: LogisticsGeoMapProps) {
  const {
    routes,
    markers,
    selectedMarkerId,
    onMarkerSelect,
    loading,
    unavailable,
    onRetry,
    className,
    children,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapRenderMode, setMapRenderMode] =
    useState<MapRenderMode>("vector-3d");
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [restrictionsVisible, setRestrictionsVisible] = useState(true);
  const [buildingsVisible, setBuildingsVisible] = useState(true);
  const capability = useWebglCapability();
  const visibleRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          (!route.layer || route.layer !== "traffic" || trafficVisible) &&
          (!route.layer ||
            route.layer !== "restrictions" ||
            restrictionsVisible),
      ),
    [restrictionsVisible, routes, trafficVisible],
  );
  const bounds = useMemo(
    () => getOperationalBounds(visibleRoutes, markers),
    [markers, visibleRoutes],
  );
  const latestDataRef = useRef({
    bounds,
    markers,
    onMarkerSelect,
    visibleRoutes,
  });

  useEffect(() => {
    latestDataRef.current = {
      bounds,
      markers,
      onMarkerSelect,
      visibleRoutes,
    };
  }, [bounds, markers, onMarkerSelect, visibleRoutes]);

  const resetView = useCallback(() => {
    if (!mapRef.current || !bounds) return;
    mapRef.current.fitBounds(bounds, {
      padding: 70,
      pitch: getResponsivePitch(),
      bearing: -18,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 700,
    });
  }, [bounds]);

  useEffect(() => {
    if (
      capability !== "supported" ||
      loading ||
      unavailable ||
      mapFailed ||
      !containerRef.current
    ) {
      return;
    }

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let styleLoadTimeout: number | undefined;

    void loadMapLibre()
      .then((maplibre) => {
        if (disposed || !containerRef.current) return;
        const map = new maplibre.Map({
          container: containerRef.current,
          style: MAP_RUNTIME_CONFIG.styleUrl,
          center: [105.2, 6.1],
          zoom: 4.8,
          pitch: getResponsivePitch(),
          bearing: -18,
          canvasContextAttributes: { antialias: true },
          attributionControl: {},
          cooperativeGestures: true,
        });
        let hasLoadedStyle = false;
        let hasRenderedMap = false;
        let usingLiteStyle = false;
        const armStyleLoadTimeout = (onTimeout: () => void) => {
          window.clearTimeout(styleLoadTimeout);
          styleLoadTimeout = window.setTimeout(
            onTimeout,
            MAP_STYLE_LOAD_TIMEOUT_MS,
          );
        };
        const activateLiteStyle = () => {
          if (disposed || hasRenderedMap || usingLiteStyle) return;
          usingLiteStyle = true;
          hasLoadedStyle = false;
          setMapRenderMode("vector-lite");
          armStyleLoadTimeout(() => {
            if (!disposed && !hasRenderedMap) setMapFailed(true);
          });
          map.setStyle(OPENFREEMAP_LITE_STYLE);
        };
        mapRef.current = map;
        map.addControl(
          new maplibre.NavigationControl({ visualizePitch: true }),
          "bottom-right",
        );
        map.addControl(new maplibre.ScaleControl(), "bottom-left");
        map.on("error", () => undefined);
        map.on("webglcontextlost", () => {
          if (!disposed) setMapFailed(true);
        });
        map.on("style.load", () => {
          if (disposed) return;
          hasLoadedStyle = true;
          const latest = latestDataRef.current;
          syncOperationalLayers(map, latest.visibleRoutes, latest.markers);
          const hasBuildings = addBuildingExtrusions(map);
          if (usingLiteStyle) {
            setMapRenderMode(hasBuildings ? "vector-lite-3d" : "vector-lite");
          } else {
            addTerrain(map, MAP_RUNTIME_CONFIG.terrainUrl);
            setMapRenderMode(hasBuildings ? "vector-3d" : "vector");
          }
          if (latest.bounds) {
            map.fitBounds(latest.bounds, {
              padding: 70,
              pitch: getResponsivePitch(),
              bearing: -18,
              duration: 0,
            });
          }
        });
        map.on("load", () => {
          if (disposed || !hasLoadedStyle) return;
          hasRenderedMap = true;
          window.clearTimeout(styleLoadTimeout);
          setMapReady(true);
        });
        map.on("click", "aurora-markers", (event) => {
          const markerId = event.features?.[0]?.properties?.id;
          if (typeof markerId === "string") {
            latestDataRef.current.onMarkerSelect?.(markerId);
          }
        });
        map.on("mouseenter", "aurora-markers", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "aurora-markers", () => {
          map.getCanvas().style.cursor = "";
        });
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map.resize());
          resizeObserver.observe(containerRef.current);
        }
        armStyleLoadTimeout(activateLiteStyle);
      })
      .catch(() => setMapFailed(true));

    return () => {
      disposed = true;
      window.clearTimeout(styleLoadTimeout);
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [capability, loading, mapFailed, unavailable]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    syncOperationalLayers(map, visibleRoutes, markers);
    if (bounds) resetView();
  }, [bounds, mapReady, markers, resetView, visibleRoutes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (map.getLayer("aurora-3d-buildings")) {
      map.setLayoutProperty(
        "aurora-3d-buildings",
        "visibility",
        buildingsVisible ? "visible" : "none",
      );
    }
  }, [buildingsVisible, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (map.getLayer(SHIPMENT_MODEL_LAYER_ID)) {
      map.removeLayer(SHIPMENT_MODEL_LAYER_ID);
    }
    const selectedMarker = markers.find(
      (marker) => marker.id === selectedMarkerId,
    );
    if (
      selectedMarker &&
      selectedMarker.tone === "current" &&
      canRenderShipmentModel(map.getCanvas())
    ) {
      map.addLayer(createShipmentModelLayer(selectedMarker));
    }
  }, [mapReady, markers, selectedMarkerId]);

  if (loading || unavailable || capability !== "supported" || mapFailed) {
    return (
      <div className="relative">
        <SvgMapFallback
          {...props}
          unavailable={unavailable}
          onRetry={() => {
            setMapFailed(false);
            onRetry?.();
          }}
        />
        <MapStatusOverlay
          terrainEnabled={MAP_RUNTIME_CONFIG.hasTerrain}
          mode="svg"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-80 overflow-hidden rounded-xl border border-sky-100 bg-[#dcefff]",
        className,
      )}
      aria-label="Real 3D shipment map"
    >
      <div ref={containerRef} className="absolute inset-0" />
      {!mapReady && (
        <div className="absolute inset-0 grid place-items-center bg-sky-50/90 text-sm font-medium text-slate-600">
          Loading real 3D map
        </div>
      )}
      <MapControls
        trafficVisible={trafficVisible}
        restrictionsVisible={restrictionsVisible}
        buildingsVisible={buildingsVisible}
        buildingsAvailable={
          mapReady &&
          (mapRenderMode === "vector-3d" || mapRenderMode === "vector-lite-3d")
        }
        terrainEnabled={MAP_RUNTIME_CONFIG.hasTerrain}
        onTrafficChange={() => setTrafficVisible((value) => !value)}
        onRestrictionsChange={() => setRestrictionsVisible((value) => !value)}
        onBuildingsChange={() => setBuildingsVisible((value) => !value)}
        onReset={resetView}
      />
      {mapReady && (
        <MapStatusOverlay
          terrainEnabled={MAP_RUNTIME_CONFIG.hasTerrain}
          mode={mapRenderMode}
        />
      )}
      <p className="sr-only">
        Real basemap from OpenFreeMap and OpenStreetMap data. Shipment telemetry
        is simulated and no live GPS transport is connected.
      </p>
      {children}
    </div>
  );
}
