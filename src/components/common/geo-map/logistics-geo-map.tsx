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
import { MapPointerCoordinates } from "./components/map-pointer-coordinates";
import { SvgMapFallback } from "./components/svg-map-fallback";
import { useWebglCapability } from "./hooks/use-webgl-capability";
import { useMapMarkerReconciliation } from "./hooks/use-map-marker-reconciliation";
import type { MapHealthState } from "./types/map-health";
import {
  classifyMapLibreError,
  getCachedMapLibreWorkerAssets,
} from "./utils/maplibre-asset-health";
import type { LogisticsGeoMarker, LogisticsGeoRoute } from "./types";
import { getDomMarkerIds, getOperationalBounds } from "./utils/geojson";
import { getDocumentBaseUri, loadMapLibre } from "./utils/load-maplibre";
import { getMapPitch } from "./utils/map-style";
import {
  addBuildingExtrusions,
  addTerrain,
  setBuildingLayersVisibility,
  syncOperationalLayers,
} from "./utils/operational-layers";
import {
  canRenderShipmentModel,
  createShipmentModelLayer,
  SHIPMENT_MODEL_LAYER_ID,
} from "./utils/shipment-model-layer";
import { MapMarkerPopup } from "./components/map-marker-popup";

type MapLibreModule = Awaited<ReturnType<typeof loadMapLibre>>;

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
  const mapLibreModuleRef = useRef<MapLibreModule | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [healthState, setHealthState] = useState<MapHealthState>("checking");
  const [retryNonce, setRetryNonce] = useState(0);
  const [buildingsAvailable, setBuildingsAvailable] = useState(false);
  const [pointerCoordinates, setPointerCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [restrictionsVisible, setRestrictionsVisible] = useState(true);
  const [buildingsVisible, setBuildingsVisible] = useState(true);
  const capability = useWebglCapability();
  const selectedMarker = markers.find(
    (marker) => marker.id === selectedMarkerId,
  );
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
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
  const operationalDataKey = useMemo(
    () =>
      JSON.stringify({
        routes: visibleRoutes.map((route) => [
          route.id,
          route.kind,
          route.coordinates,
        ]),
        markers: markers.map((marker) => [
          marker.id,
          marker.position,
          marker.tone,
          marker.shipmentId,
        ]),
      }),
    [markers, visibleRoutes],
  );
  const previousOperationalDataKeyRef = useRef<string | undefined>(undefined);
  const lastFocusedMarkerIdRef = useRef<string | undefined>(undefined);
  const latestDataRef = useRef({
    bounds,
    domMarkerIds: getDomMarkerIds(markers, selectedMarkerId),
    markers,
    onMarkerSelect,
    visibleRoutes,
  });

  useEffect(() => {
    latestDataRef.current = {
      bounds,
      domMarkerIds: getDomMarkerIds(markers, selectedMarkerId),
      markers,
      onMarkerSelect,
      visibleRoutes,
    };
  }, [bounds, markers, onMarkerSelect, selectedMarkerId, visibleRoutes]);

  const resetView = useCallback(() => {
    const currentBounds = latestDataRef.current.bounds;
    if (!mapRef.current || !currentBounds) return;
    mapRef.current.fitBounds(currentBounds, {
      padding: 70,
      pitch: getResponsivePitch(),
      bearing: -18,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 700,
    });
  }, []);

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
    let resizeFrameId: number | undefined;

    setHealthState("checking");
    const baseUri = getDocumentBaseUri();

    void getCachedMapLibreWorkerAssets(fetch, baseUri)
      .then((assetHealth) => {
        if (disposed) return;
        if (!assetHealth.ok) {
          setHealthState("worker-error");
          setMapFailed(true);
          return;
        }

        return loadMapLibre(baseUri).then((maplibre) => {
          if (disposed || !containerRef.current) return;
          mapLibreModuleRef.current = maplibre;
          const map = new maplibre.Map({
            container: containerRef.current,
            style: MAP_RUNTIME_CONFIG.styleUrl,
            center: [105.2, 6.1],
            zoom: 4.8,
            pitch: getResponsivePitch(),
            bearing: -18,
            canvasContextAttributes: {
              antialias: true,
              contextType: "webgl2",
            },
            attributionControl: {},
            cooperativeGestures: true,
          });
          let hasLoadedStyle = false;
          let hasRenderedMap = false;
          let currentStage: "primary" | "independent" | "resilient" | "failed" =
            "primary";
          const armStyleLoadTimeout = (onTimeout: () => void) => {
            window.clearTimeout(styleLoadTimeout);
            styleLoadTimeout = window.setTimeout(
              onTimeout,
              MAP_STYLE_LOAD_TIMEOUT_MS,
            );
          };
          const advanceFallback = () => {
            if (disposed || hasRenderedMap) return;

            if (currentStage === "primary") {
              if (
                MAP_RUNTIME_CONFIG.hasIndependentFallback &&
                MAP_RUNTIME_CONFIG.fallbackStyleUrl
              ) {
                currentStage = "independent";
                hasLoadedStyle = false;
                armStyleLoadTimeout(advanceFallback);
                map.setStyle(MAP_RUNTIME_CONFIG.fallbackStyleUrl);
                return;
              }
              currentStage = "resilient";
              hasLoadedStyle = false;
              armStyleLoadTimeout(advanceFallback);
              map.setStyle(OPENFREEMAP_LITE_STYLE);
              return;
            }

            if (currentStage === "independent") {
              currentStage = "resilient";
              hasLoadedStyle = false;
              armStyleLoadTimeout(advanceFallback);
              map.setStyle(OPENFREEMAP_LITE_STYLE);
              return;
            }

            if (currentStage === "resilient") {
              currentStage = "failed";
              setHealthState((prev) =>
                prev === "checking" ? "style-error" : prev,
              );
              setMapFailed(true);
              return;
            }
          };
          mapRef.current = map;
          map.resize();
          if (typeof window.requestAnimationFrame === "function") {
            resizeFrameId = window.requestAnimationFrame(() => {
              if (!disposed) map.resize();
            });
          }
          map.addControl(
            new maplibre.NavigationControl({ visualizePitch: true }),
            "bottom-right",
          );
          map.addControl(new maplibre.ScaleControl(), "bottom-left");
          map.on("error", (event) => {
            const classified = classifyMapLibreError(event?.error);
            if (classified === "worker-error") {
              setHealthState("worker-error");
              advanceFallback();
            } else if (classified === "style-error") {
              setHealthState("style-error");
              advanceFallback();
            } else if (classified === "tile-error") {
              setHealthState("tile-error");
            }
            if (process.env.NODE_ENV !== "production") {
              console.error("[LogisticsGeoMap] MapLibre error", event?.error);
            }
          });
          map.on("webglcontextlost", () => {
            if (!disposed) {
              setHealthState("webgl-error");
              setMapFailed(true);
            }
          });
        map.on("style.load", () => {
          if (disposed) return;
          map.resize();
          hasLoadedStyle = true;
          const latest = latestDataRef.current;
          syncOperationalLayers(
            map,
            latest.visibleRoutes,
            latest.markers,
            latest.domMarkerIds,
          );
          const hasBuildings = addBuildingExtrusions(map);
          setBuildingsAvailable(hasBuildings);
          if (currentStage !== "resilient") {
            addTerrain(map, MAP_RUNTIME_CONFIG.terrainUrl);
          }
          if (latest.bounds) {
            map.fitBounds(latest.bounds, {
              padding: 70,
              pitch: getResponsivePitch(),
              bearing: -18,
              duration: 0,
            });
          }
          map.triggerRepaint();
        });
        map.on("load", () => {
          if (disposed || !hasLoadedStyle) return;
          map.triggerRepaint();
        });
        map.on("idle", () => {
          if (disposed || !hasLoadedStyle) return;
          hasRenderedMap = true;
          window.clearTimeout(styleLoadTimeout);
          setMapReady(true);
          setHealthState("ready");
        });
        map.on("click", (event) => {
          const markerId = map.queryRenderedFeatures(event.point, {
            layers: ["aurora-markers"],
          })[0]?.properties?.id;
          if (typeof markerId === "string") {
            latestDataRef.current.onMarkerSelect?.(markerId);
          }
        });
        map.on("mousemove", (event) => {
          const isMarker = map.queryRenderedFeatures(event.point, {
            layers: ["aurora-markers"],
          }).length > 0;
          map.getCanvas().style.cursor = isMarker ? "pointer" : "";
          setPointerCoordinates({
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
          });
        });
        map.on("mouseout", () => setPointerCoordinates(null));
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map.resize());
          resizeObserver.observe(containerRef.current);
        }
        armStyleLoadTimeout(advanceFallback);
      });
    })
    .catch(() => {
      if (!disposed) {
        setHealthState("worker-error");
        setMapFailed(true);
      }
    });

    return () => {
      disposed = true;
      window.clearTimeout(styleLoadTimeout);
      if (resizeFrameId !== undefined) {
        window.cancelAnimationFrame(resizeFrameId);
      }
      resizeObserver?.disconnect();
      mapLibreModuleRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
      setBuildingsAvailable(false);
      setPointerCoordinates(null);
    };
  }, [capability, loading, mapFailed, retryNonce, unavailable]);

  useMapMarkerReconciliation({
    mapRef,
    mapLibreModuleRef,
    mapReady,
    markers,
    selectedMarkerId,
    onMarkerSelect,
  });

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const latest = latestDataRef.current;
    syncOperationalLayers(
      map,
      latest.visibleRoutes,
      latest.markers,
      latest.domMarkerIds,
    );
    const hasOperationalDataChanged =
      previousOperationalDataKeyRef.current !== undefined &&
      previousOperationalDataKeyRef.current !== operationalDataKey;
    previousOperationalDataKeyRef.current = operationalDataKey;
    if (hasOperationalDataChanged && latest.bounds) resetView();
  }, [
    mapReady,
    operationalDataKey,
    resetView,
    selectedMarkerId,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setBuildingLayersVisibility(map, buildingsVisible);
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

  const updateSelectedMarkerPosition = useCallback(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !selectedMarker) {
      setSelectedMarkerPosition(null);
      return;
    }

    const point = map.project([
      selectedMarker.position.longitude,
      selectedMarker.position.latitude,
    ]);
    const popupWidth = 320;
    const popupHeight = 360;
    const maxLeft = Math.max(12, container.clientWidth - popupWidth - 12);
    const maxTop = Math.max(12, container.clientHeight - popupHeight - 12);

    setSelectedMarkerPosition({
      left: Math.min(Math.max(12, point.x + 16), maxLeft),
      top: Math.min(Math.max(12, point.y - popupHeight - 16), maxTop),
    });
  }, [selectedMarker]);

  const focusMarker = useCallback((markerId: string) => {
    const map = mapRef.current;
    const marker = latestDataRef.current.markers.find(
      (item) => item.id === markerId,
    );
    if (!map || !marker) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    map.flyTo({
      center: [marker.position.longitude, marker.position.latitude],
      zoom: Math.min(14, Math.max(map.getZoom(), 10)),
      pitch: getResponsivePitch(),
      duration: reduceMotion ? 0 : 650,
      essential: true,
    });
  }, []);

  useEffect(() => {
    if (!selectedMarkerId) {
      lastFocusedMarkerIdRef.current = undefined;
      return;
    }
    if (!mapReady || lastFocusedMarkerIdRef.current === selectedMarkerId) {
      return;
    }
    if (!markers.some((marker) => marker.id === selectedMarkerId)) return;

    lastFocusedMarkerIdRef.current = selectedMarkerId;
    focusMarker(selectedMarkerId);
  }, [focusMarker, mapReady, markers, selectedMarkerId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !selectedMarker) {
      setSelectedMarkerPosition(null);
      return;
    }

    updateSelectedMarkerPosition();
    map.on("move", updateSelectedMarkerPosition);
    map.on("zoom", updateSelectedMarkerPosition);
    map.on("resize", updateSelectedMarkerPosition);

    return () => {
      map.off("move", updateSelectedMarkerPosition);
      map.off("zoom", updateSelectedMarkerPosition);
      map.off("resize", updateSelectedMarkerPosition);
    };
  }, [mapReady, selectedMarker, updateSelectedMarkerPosition]);

  if (loading || unavailable || capability !== "supported" || mapFailed) {
    return (
      <div className="relative">
        <SvgMapFallback
          {...props}
          unavailable={unavailable}
          healthState={
            capability !== "supported" ? "webgl-error" : healthState
          }
          onRetry={() => {
            setMapFailed(false);
            setHealthState("checking");
            setRetryNonce((n) => n + 1);
            onRetry?.();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-80 overflow-hidden rounded-xl border border-sky-100 bg-[#dcefff]",
        className,
      )}
      aria-label="Real 3D shipment map"
    >
      <div
        ref={containerRef}
        className="!absolute !inset-0 !h-full !w-full"
      />
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
          mapReady && buildingsAvailable
        }
        terrainEnabled={MAP_RUNTIME_CONFIG.hasTerrain}
        onTrafficChange={() => setTrafficVisible((value) => !value)}
        onRestrictionsChange={() => setRestrictionsVisible((value) => !value)}
        onBuildingsChange={() => setBuildingsVisible((value) => !value)}
        onReset={resetView}
      />
      <MapPointerCoordinates coordinates={pointerCoordinates} />
      {mapReady && selectedMarker && selectedMarkerPosition && (
        <MapMarkerPopup
          marker={selectedMarker}
          position={selectedMarkerPosition}
          onClose={() => onMarkerSelect?.("")}
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
