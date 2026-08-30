import { describe, expect, it, vi } from "vitest";
import { configureMapLibreWorker } from "./load-maplibre";

describe("configureMapLibreWorker", () => {
  it("uses the self-hosted MapLibre v6 worker", () => {
    const setWorkerUrl = vi.fn();

    configureMapLibreWorker({ setWorkerUrl });

    expect(setWorkerUrl).toHaveBeenCalledWith(
      "/maplibre/maplibre-gl-worker.mjs",
    );
  });
});
