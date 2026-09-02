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
}));

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
      this.sources.set(id, { setData() { } });
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
import { OPENFREEMAP_LITE_STYLE } from "./constants/map-config";

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
});
