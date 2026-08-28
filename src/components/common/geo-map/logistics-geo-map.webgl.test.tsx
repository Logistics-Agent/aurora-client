import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mapHarness = vi.hoisted(() => ({
  constructed: 0,
  loadCalls: 0,
  setStyles: [] as unknown[],
  handlers: new Map<string, () => void>(),
}));

vi.mock("./hooks/use-webgl-capability", () => ({
  useWebglCapability: () => "supported",
}));

vi.mock("./utils/load-maplibre", () => {
  class MockMap {
    sources = new Map<string, { setData: () => void }>();
    layers = new Set<string>();

    constructor() {
      mapHarness.constructed += 1;
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
    setTerrain() { }
    setStyle(style: unknown) {
      mapHarness.setStyles.push(style);
    }
    setLayoutProperty() { }
    removeLayer(id: string) {
      this.layers.delete(id);
    }
    getCanvas() {
      return document.createElement("canvas");
    }
    resize() { }
    remove() { }
    on(event: string, layerOrHandler: string | (() => void)) {
      if (typeof layerOrHandler === "function") {
        mapHarness.handlers.set(event, layerOrHandler);
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
            NavigationControl: class { },
            ScaleControl: class { },
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
    mapHarness.setStyles = [];
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
    });
    act(() => mapHarness.handlers.get("style.load")?.());

    expect(screen.getByText("Loading real 3D map")).toBeInTheDocument();
    expect(
      screen.queryByText("Real vector map · 3D unavailable"),
    ).not.toBeInTheDocument();
    act(() => mapHarness.handlers.get("load")?.());

    expect(screen.queryByText("Loading real 3D map")).not.toBeInTheDocument();
    expect(screen.getByText("Real vector map · 3D unavailable")).toBeVisible();
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

    expect(screen.queryByText("Loading real 3D map")).not.toBeInTheDocument();
    expect(screen.getByText("Real vector map · resilient style")).toBeVisible();
  });

  it("does not wait forever when the primary provider hangs", () => {
    vi.useFakeTimers();
    render(<LogisticsGeoMap routes={[]} markers={[]} />);

    act(() => mapHarness.handlers.get("style.load")?.());
    expect(mapHarness.setStyles).toHaveLength(0);
    act(() => vi.advanceTimersByTime(8_000));

    expect(mapHarness.setStyles).toHaveLength(1);
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
    act(() => mapHarness.handlers.get("webglcontextlost")?.());

    expect(screen.getByText("3D map fallback")).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Shipment position/ }),
    ).toBeVisible();
  });
});
