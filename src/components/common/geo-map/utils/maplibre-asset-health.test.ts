import { describe, expect, it, vi } from "vitest";
import {
  checkMapLibreWorkerAssets,
  classifyMapLibreError,
  getCachedMapLibreWorkerAssets,
} from "./maplibre-asset-health";

describe("checkMapLibreWorkerAssets", () => {
  it("returns ok: true when both worker and shared assets return HTTP ok", async () => {
    const fetcher = vi.fn().mockImplementation(async () => {
      return { ok: true, status: 200 } as Response;
    });


    const result = await checkMapLibreWorkerAssets(fetcher);

    expect(result).toEqual({
      worker: "ok",
      shared: "ok",
      ok: true,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(
      "/maplibre/maplibre-gl-worker.mjs",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetcher).toHaveBeenCalledWith(
      "/maplibre/maplibre-gl-shared.mjs",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns ok: false when worker file fails", async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("maplibre-gl-worker.mjs")) {
        return { ok: false, status: 404 } as Response;
      }
      return { ok: true, status: 200 } as Response;
    });

    const result = await checkMapLibreWorkerAssets(fetcher);

    expect(result).toEqual({
      worker: "error",
      shared: "ok",
      ok: false,
    });
  });

  it("returns ok: false when shared file fails", async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("maplibre-gl-shared.mjs")) {
        return { ok: false, status: 404 } as Response;
      }
      return { ok: true, status: 200 } as Response;
    });

    const result = await checkMapLibreWorkerAssets(fetcher);

    expect(result).toEqual({
      worker: "ok",
      shared: "error",
      ok: false,
    });
  });

  it("handles fetch network exceptions gracefully", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Network offline"));

    const result = await checkMapLibreWorkerAssets(fetcher);

    expect(result).toEqual({
      worker: "error",
      shared: "error",
      ok: false,
    });
  });

  it("respects sub-path baseUri", async () => {
    const fetcher = vi.fn().mockImplementation(async () => {
      return { ok: true, status: 200 } as Response;
    });

    await checkMapLibreWorkerAssets(fetcher, "/aurora/");

    expect(fetcher).toHaveBeenCalledWith(
      "/aurora/maplibre/maplibre-gl-worker.mjs",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetcher).toHaveBeenCalledWith(
      "/aurora/maplibre/maplibre-gl-shared.mjs",
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});

describe("getCachedMapLibreWorkerAssets", () => {
  it("deduplicates concurrent successful asset checks for the same base URI", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true } as Response);

    const first = getCachedMapLibreWorkerAssets(fetcher, "/cached-map/");
    const second = getCachedMapLibreWorkerAssets(fetcher, "/cached-map/");

    await Promise.all([first, second]);
    await getCachedMapLibreWorkerAssets(fetcher, "/cached-map/");

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe("classifyMapLibreError", () => {
  it("classifies worker errors correctly", () => {
    expect(
      classifyMapLibreError({ message: "Failed to load worker script" }),
    ).toBe("worker-error");
    expect(
      classifyMapLibreError({ url: "/maplibre/maplibre-gl-worker.mjs" }),
    ).toBe("worker-error");
    expect(
      classifyMapLibreError({ url: "/maplibre/maplibre-gl-shared.mjs" }),
    ).toBe("worker-error");
  });

  it("classifies style errors correctly", () => {
    expect(classifyMapLibreError({ dataType: "style" })).toBe("style-error");
    expect(
      classifyMapLibreError({
        url: "https://tiles.openfreemap.org/styles/liberty",
      }),
    ).toBe("style-error");
    expect(
      classifyMapLibreError({
        url: "https://example.com/style.json",
      }),
    ).toBe("style-error");
  });

  it("classifies tile errors correctly", () => {
    expect(classifyMapLibreError({ dataType: "tile" })).toBe("tile-error");
    expect(
      classifyMapLibreError({
        url: "https://tiles.openfreemap.org/planet/5/20/12.pbf",
      }),
    ).toBe("tile-error");
    expect(
      classifyMapLibreError({
        url: "https://tiles.example.com/1/2/3.mvt",
      }),
    ).toBe("tile-error");
  });

  it("returns unknown for unclassified errors", () => {
    expect(classifyMapLibreError(null)).toBe("unknown");
    expect(classifyMapLibreError(undefined)).toBe("unknown");
    expect(classifyMapLibreError({ message: "Network connection reset" })).toBe(
      "unknown",
    );
  });
});
