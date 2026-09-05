import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mapHarness = vi.hoisted(() => ({
  constructed: 0,
  loadCalls: 0,
  resizeCalls: 0,
  setStyles: [] as unknown[],
  handlers: new Map<string, (event?: unknown) => void>(),
  mapOptions: undefined as Record<string, unknown> | undefined,
  navigationOptions: undefined as unknown,
  renderedFeatures: [] as unknown[],
  flyToCalls: [] as unknown[],
  markers: [] as Array<{ element: HTMLElement; removed: boolean }>,
  setDataCalls: 0,
  workerAssetHealth: {
    worker: "ok" as "ok" | "error",
    shared: "ok" as "ok" | "error",
    ok: true,
  },
}));

vi.mock("./utils/maplibre-asset-health", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./utils/maplibre-asset-health")>();
  return {
    ...actual,
    getCachedMapLibreWorkerAssets: vi.fn().mockImplementation(() => ({
      then(onFulfill: (val: unknown) => unknown) {
        return Promise.resolve(onFulfill(mapHarness.workerAssetHealth));
      },
      catch() {
        return this;
      },
    })),
  };
});

vi.mock("./hooks/use-webgl-capability", () => ({
  useWebglCapability: () => "supported",
}));

vi.mock("./utils/load-maplibre", () => {
  class MockMap {
    sources = new Map<string, { setData: () => void }>();
    layers = new Set<string>();

    constructor(options: Record<string, unknown>) {
      mapHarness.constructed += 1;
      mapHarness.mapOptions = options;
    }

    addControl() { }
    addSource(id: string) {
      this.sources.set(id, {
        setData() {
          mapHarness.setDataCalls += 1;
        },
      });
    }
    getSource(id: string) {
      return this.sources.get(id);
    }
    addLayer(layer: { id: string }) {
      this.layers.add(layer.id);
    }
    getLayer(id: string) {
      return this.layers.has(id) ? { id } : undefined;
    }
    getStyle() {
      return { version: 8, sources: {}, layers: [] };
    }
    fitBounds() { }
    getZoom() {
      return 4.8;
    }
    flyTo(options: unknown) {
      mapHarness.flyToCalls.push(options);
    }
    project() {
      return { x: 140, y: 150 };
    }
    queryRenderedFeatures(
      _point: unknown,
      options?: { layers?: string[] },
    ) {
      return options?.layers?.includes("aurora-markers")
        ? mapHarness.renderedFeatures
        : [];
    }
    setTerrain() { }
    setStyle(style: unknown) {
      mapHarness.setStyles.push(style);
    }
    setLayoutProperty() { }
    triggerRepaint() { }
    removeLayer(id: string) {
      this.layers.delete(id);
    }
    getCanvas() {
      return document.createElement("canvas");
    }
    resize() {
      mapHarness.resizeCalls += 1;
    }
    remove() { }
    on(
      event: string,
      layerOrHandler: string | ((event?: unknown) => void),
      maybeHandler?: (event?: unknown) => void,
    ) {
      if (typeof layerOrHandler === "function") {
        mapHarness.handlers.set(event, layerOrHandler);
      } else if (maybeHandler) {
        mapHarness.handlers.set(`${event}:${layerOrHandler}`, maybeHandler);
      }
    }
    off(
      event: string,
      layerOrHandler: string | ((event?: unknown) => void),
      maybeHandler?: (event?: unknown) => void,
    ) {
      const key =
        typeof layerOrHandler === "string"
          ? `${event}:${layerOrHandler}`
          : event;
      if (!maybeHandler || typeof layerOrHandler === "string") {
        mapHarness.handlers.delete(key);
      }
    }
  }

  return {
    getDocumentBaseUri: () => undefined,
    loadMapLibre: () => {
      mapHarness.loadCalls += 1;
      return {
        then(onLoaded: (module: object) => void) {
          onLoaded({
            Map: MockMap,
            NavigationControl: class {
              constructor(options: unknown) {
                mapHarness.navigationOptions = options;
              }
            },
            ScaleControl: class { },
            Marker: class {
              element: HTMLElement;
              removed = false;

              constructor(options: { element: HTMLElement }) {
                this.element = options.element;
                mapHarness.markers.push(this);
              }

              setLngLat() {
                return this;
              }

              getElement() {
                return this.element;
              }

              addTo() {
                return this;
              }

              remove() {
                this.removed = true;
              }
            },
          });
          return Promise.resolve();
        },
      };
    },
  };
});

import { LogisticsGeoMap } from "./logistics-geo-map";
import {
  MAP_RUNTIME_CONFIG,
  OPENFREEMAP_LITE_STYLE,
} from "./constants/map-config";

describe("LogisticsGeoMap WebGL readiness", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    mapHarness.constructed = 0;
    mapHarness.loadCalls = 0;
    mapHarness.resizeCalls = 0;
    mapHarness.setStyles = [];
    mapHarness.mapOptions = undefined;
    mapHarness.navigationOptions = undefined;
    mapHarness.renderedFeatures = [];
    mapHarness.flyToCalls = [];
    mapHarness.markers = [];
    mapHarness.setDataCalls = 0;
    mapHarness.workerAssetHealth = {
      worker: "ok",
      shared: "ok",
      ok: true,
    };
    mapHarness.handlers.clear();
  });

  it("reveals the map only after the first visually complete render", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    expect(screen.getByText("Loading real 3D map")).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(mapHarness.loadCalls).toBe(1);
      expect(mapHarness.constructed).toBe(1);
      expect(mapHarness.handlers.has("style.load")).toBe(true);
      expect(mapHarness.handlers.has("load")).toBe(true);
      expect(mapHarness.handlers.has("idle")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());

    expect(screen.getByText("Loading real 3D map")).toBeInTheDocument();
    act(() => mapHarness.handlers.get("load")?.());

    expect(screen.getByText("Loading real 3D map")).toBeInTheDocument();
    act(() => mapHarness.handlers.get("idle")?.());

    expect(screen.queryByText("Loading real 3D map")).not.toBeInTheDocument();
  });

  it("resizes MapLibre after the map container is mounted", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(mapHarness.constructed).toBe(1);
      expect(mapHarness.resizeCalls).toBeGreaterThan(0);
    });
  });

  it("keeps the draggable MapLibre compass with pitch visualization", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(mapHarness.navigationOptions).toEqual({
        visualizePitch: true,
      });
    });
  });

  it("allows the map viewport to move beyond Southeast Asia", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(mapHarness.mapOptions?.maxBounds).toBeUndefined();
    });
  });

  it("shows marker details only after the marker is clicked", async () => {
    function ClickHarness() {
      const [selectedMarkerId, setSelectedMarkerId] = useState("");

      return (
        <LogisticsGeoMap
          routes={[]}
          markers={[
            {
              id: "shipment",
              label: "Cargo shipment",
              detail: "Position received via satellite",
              tone: "current",
              position: { longitude: 106.7, latitude: 10.77 },
              shipmentId: "SHP-128",
            },
          ]}
          selectedMarkerId={selectedMarkerId}
          onMarkerSelect={setSelectedMarkerId}
        />
      );
    }

    render(<ClickHarness />);

    expect(screen.queryByText("Cargo shipment")).not.toBeInTheDocument();
    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("style.load")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());
    mapHarness.renderedFeatures = [
      { properties: { id: "shipment" } },
    ];
    act(() =>
      mapHarness.handlers.get("click")?.({ point: { x: 140, y: 150 } }),
    );

    expect(screen.getByText("Cargo shipment")).toBeVisible();
    expect(screen.getByText("Position received via satellite")).toBeVisible();
    expect(mapHarness.flyToCalls).toHaveLength(1);
    expect(mapHarness.flyToCalls[0]).toMatchObject({
      center: [106.7, 10.77],
      zoom: 10,
    });
  });

  it("shows the pointer coordinates while moving over the map", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("mousemove")).toBe(true);
    });

    act(() =>
      mapHarness.handlers.get("mousemove")?.({
        point: { x: 140, y: 150 },
        lngLat: { lat: 10.77, lng: 106.7 },
      }),
    );

    expect(screen.getByRole("status", { name: "Pointer coordinates" })).toHaveTextContent(
      "(10.770000, 106.700000)",
    );

    act(() => mapHarness.handlers.get("mouseout")?.());
    expect(
      screen.queryByRole("status", { name: "Pointer coordinates" }),
    ).not.toBeInTheDocument();
  });

  it("renders a custom transport marker when shipment metadata is available", async () => {
    render(
      <LogisticsGeoMap
        routes={[]}
        markers={[
          {
            id: "ocean-shipment",
            label: "Ocean shipment",
            detail: "At hub",
            tone: "origin",
            position: { longitude: 106.7, latitude: 10.77 },
            metadata: { mode: "Ocean", status: "At hub" },
          },
        ]}
      />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("style.load")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    expect(mapHarness.markers).toHaveLength(1);
    expect(mapHarness.markers[0].element).toHaveAttribute(
      "aria-label",
      "Ocean shipment · Ocean · At hub",
    );
    expect(
      mapHarness.markers[0].element.querySelector("[data-icon=ship]"),
    ).not.toBeNull();
  });

  it("renders a custom location icon when transport metadata is unavailable", async () => {
    render(
      <LogisticsGeoMap
        routes={[]}
        markers={[
          {
            id: "warehouse",
            label: "HCM Warehouse",
            detail: "Origin",
            tone: "origin",
            position: { longitude: 106.7, latitude: 10.77 },
          },
        ]}
      />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("style.load")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    expect(mapHarness.markers).toHaveLength(1);
    expect(mapHarness.markers[0].element).toHaveAttribute(
      "aria-label",
      "HCM Warehouse",
    );
    expect(
      mapHarness.markers[0].element.querySelector("[data-icon=warehouse]"),
    ).not.toBeNull();
  });

  it("gives the primary vector style time to recover from a resource error", async () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    expect(mapHarness.handlers.has("error")).toBe(true);
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("error")?.());

    expect(mapHarness.setStyles).toHaveLength(0);
    act(() => vi.advanceTimersByTime(8_000));

    expect(mapHarness.setStyles).toEqual([OPENFREEMAP_LITE_STYLE]);
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    expect(screen.queryByText("Loading real 3D map")).not.toBeInTheDocument();
  });

  it("does not wait forever when the primary provider hangs", () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() => mapHarness.handlers.get("style.load")?.());
    expect(mapHarness.setStyles).toHaveLength(0);
    act(() => vi.advanceTimersByTime(8_000));

    expect(mapHarness.setStyles).toHaveLength(1);
  });

  it("falls back when the style loads but never reaches a rendered idle frame", () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    expect(screen.getByText("Loading real 3D map")).toBeVisible();

    act(() => vi.advanceTimersByTime(8_000));

    expect(mapHarness.setStyles).toEqual([OPENFREEMAP_LITE_STYLE]);
  });

  it("keeps shipment routes usable when both vector styles fail", () => {
    vi.useFakeTimers();
    render(
      <LogisticsGeoMap
        routes={[]}
        markers={[
          {
            id: "shipment",
            label: "Shipment position",
            detail: "Simulated fixture",
            tone: "current",
            position: { longitude: 106.7, latitude: 10.77 },
          },
        ]}
      />,
    );

    act(() => vi.advanceTimersByTime(8_000));
    act(() => vi.advanceTimersByTime(8_000));

    expect(screen.getByText("3D map fallback")).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Shipment position/ }),
    ).toBeVisible();
    expect(screen.queryByText("Map tiles unavailable")).not.toBeInTheDocument();
  });

  it("falls back to independent fallback URL first when configured, then resilient style, then SVG", () => {
    const originalFallback = MAP_RUNTIME_CONFIG.fallbackStyleUrl;
    const originalHasFallback = MAP_RUNTIME_CONFIG.hasIndependentFallback;
    try {
      MAP_RUNTIME_CONFIG.fallbackStyleUrl =
        "https://secondary.example/style.json";
      MAP_RUNTIME_CONFIG.hasIndependentFallback = true;

      vi.useFakeTimers();
      render(<LogisticsGeoMap routes={[]} markers={[]} />);

      // Stage 1: primary style times out -> secondary URL
      act(() => vi.advanceTimersByTime(8_000));
      expect(mapHarness.setStyles).toEqual([
        "https://secondary.example/style.json",
      ]);

      // Stage 2: secondary style times out -> resilient style
      act(() => vi.advanceTimersByTime(8_000));
      expect(mapHarness.setStyles).toEqual([
        "https://secondary.example/style.json",
        OPENFREEMAP_LITE_STYLE,
      ]);

      // Stage 3: resilient style times out -> SVG fallback
      act(() => vi.advanceTimersByTime(8_000));
      expect(screen.getByText("3D map fallback")).toBeVisible();
    } finally {
      MAP_RUNTIME_CONFIG.fallbackStyleUrl = originalFallback;
      MAP_RUNTIME_CONFIG.hasIndependentFallback = originalHasFallback;
    }
  });

  it("does not request secondary URL when independent fallback is not configured", () => {
    expect(MAP_RUNTIME_CONFIG.hasIndependentFallback).toBe(false);
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() => vi.advanceTimersByTime(8_000));
    expect(mapHarness.setStyles).toEqual([OPENFREEMAP_LITE_STYLE]);
  });

  it("does not resync operational sources when rerendered with equivalent data", async () => {
    const routes = [
      {
        id: "route",
        label: "Route",
        kind: "current" as const,
        coordinates: [
          { longitude: 105, latitude: 6 },
          { longitude: 106, latitude: 7 },
        ],
      },
    ];
    const markers = [
      {
        id: "vehicle",
        label: "Vehicle",
        detail: "Current",
        tone: "current" as const,
        position: { longitude: 105, latitude: 6 },
      },
    ];
    const { rerender } = render(
      <LogisticsGeoMap routes={routes} markers={markers} />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("idle")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    const setDataCallsAfterReady = mapHarness.setDataCalls;
    rerender(
      <LogisticsGeoMap
        routes={routes.map((route) => ({ ...route }))}
        markers={markers.map((marker) => ({ ...marker }))}
      />,
    );

    expect(mapHarness.setDataCalls).toBe(setDataCallsAfterReady);
  });
  it("advances to the next style immediately after a style resource error", () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() =>
      mapHarness.handlers.get("error")?.({
        error: { dataType: "style", message: "style request failed" },
      }),
    );

    expect(mapHarness.setStyles).toEqual([OPENFREEMAP_LITE_STYLE]);
  });

  it("recovers with an interactive fallback when Brave loses WebGL", async () => {
    render(
      <LogisticsGeoMap
        routes={[]}
        markers={[
          {
            id: "shipment",
            label: "Shipment position",
            detail: "Simulated fixture",
            tone: "current",
            position: { longitude: 106.7, latitude: 10.77 },
          },
        ]}
      />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("webglcontextlost")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());
    act(() => mapHarness.handlers.get("webglcontextlost")?.());

    expect(screen.getByText("3D map fallback")).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Shipment position/ }),
    ).toBeVisible();
  });

  it("fails immediately to SVG fallback with retry when worker assets are unavailable", async () => {
    mapHarness.workerAssetHealth = {
      worker: "error",
      shared: "ok",
      ok: false,
    };

    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(screen.getByText("3D map fallback")).toBeVisible();
    });
    expect(mapHarness.constructed).toBe(0);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByText("3D map fallback")).toHaveAttribute(
      "data-health-state",
      "worker-error",
    );
  });

  it("records health state and ignores recoverable tile errors until timeout", async () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() => mapHarness.handlers.get("style.load")?.());
    // Fire tile error
    act(() => {
      mapHarness.handlers.get("error")?.({
        error: { dataType: "tile", message: "404 tile not found" },
      });
    });

    // Tile error should NOT trigger fallback immediately
    expect(mapHarness.setStyles).toHaveLength(0);
    expect(screen.queryByText("3D map fallback")).not.toBeInTheDocument();

    // Advancing timeout should trigger fallback
    act(() => vi.advanceTimersByTime(8_000));
    expect(mapHarness.setStyles).toHaveLength(1);
  });

  it("sets data-health-state on fallback when webglcontextlost occurs", async () => {
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("webglcontextlost")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());
    act(() => mapHarness.handlers.get("webglcontextlost")?.());

    expect(screen.getByText("3D map fallback")).toBeVisible();
    expect(screen.getByText("3D map fallback")).toHaveAttribute(
      "data-health-state",
      "webgl-error",
    );
  });

  it("retains accessible HTML markers for small datasets", async () => {
    const markers = Array.from({ length: 5 }, (_, i) => ({
      id: `marker-${i}`,
      label: `Marker ${i}`,
      detail: `Detail ${i}`,
      tone: "origin" as const,
      position: { longitude: 106.0 + i * 0.1, latitude: 10.0 + i * 0.1 },
    }));

    render(<LogisticsGeoMap routes={[]} markers={markers} />);

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("idle")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    expect(mapHarness.markers).toHaveLength(5);
  });

  it("renders DOM markers only for selected and current markers when dataset exceeds threshold", async () => {
    const markers = Array.from({ length: 150 }, (_, i) => ({
      id: `marker-${i}`,
      label: `Marker ${i}`,
      detail: `Detail ${i}`,
      tone: i === 0 ? ("current" as const) : ("origin" as const),
      position: { longitude: 106.0 + i * 0.01, latitude: 10.0 + i * 0.01 },
    }));

    render(
      <LogisticsGeoMap
        routes={[]}
        markers={markers}
        selectedMarkerId="marker-42"
      />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("idle")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    // Should NOT create 150 DOM markers!
    expect(mapHarness.markers.length).toBeLessThan(10);
    expect(mapHarness.markers.length).toBe(2);
  });

  it("reconciles and removes stale DOM markers when selection changes in large datasets", async () => {
    const markers = Array.from({ length: 120 }, (_, i) => ({
      id: `marker-${i}`,
      label: `Marker ${i}`,
      detail: `Detail ${i}`,
      tone: "origin" as const,
      position: { longitude: 106.0 + i * 0.01, latitude: 10.0 + i * 0.01 },
    }));

    const { rerender } = render(
      <LogisticsGeoMap
        routes={[]}
        markers={markers}
        selectedMarkerId="marker-10"
      />,
    );

    await vi.waitFor(() => {
      expect(mapHarness.handlers.has("idle")).toBe(true);
    });
    act(() => mapHarness.handlers.get("style.load")?.());
    act(() => mapHarness.handlers.get("load")?.());
    act(() => mapHarness.handlers.get("idle")?.());

    expect(mapHarness.markers.length).toBe(1);
    const initialMarker = mapHarness.markers[0];
    expect(initialMarker.removed).toBe(false);

    rerender(
      <LogisticsGeoMap
        routes={[]}
        markers={markers}
        selectedMarkerId="marker-20"
      />,
    );

    expect(initialMarker.removed).toBe(true);
  });
});
