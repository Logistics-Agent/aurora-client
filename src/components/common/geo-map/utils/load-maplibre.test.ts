import { describe, expect, it, vi } from "vitest";
import {
  configureMapLibreWorker,
  getMapLibreSharedUrl,
  getMapLibreWorkerUrl,
} from "./load-maplibre";
describe("getMapLibreWorkerUrl & getMapLibreSharedUrl", () => {
  it("resolves default root paths when baseUri is undefined or empty", () => {
    expect(getMapLibreWorkerUrl()).toBe("/maplibre/maplibre-gl-worker.mjs");
    expect(getMapLibreSharedUrl()).toBe("/maplibre/maplibre-gl-shared.mjs");
    expect(getMapLibreWorkerUrl("")).toBe("/maplibre/maplibre-gl-worker.mjs");
    expect(getMapLibreSharedUrl("")).toBe("/maplibre/maplibre-gl-shared.mjs");
  });

  it("resolves paths under root '/' correctly", () => {
    expect(getMapLibreWorkerUrl("/")).toBe("/maplibre/maplibre-gl-worker.mjs");
    expect(getMapLibreSharedUrl("/")).toBe("/maplibre/maplibre-gl-shared.mjs");
  });

  it("resolves paths under sub-path '/aurora/' with or without trailing slash", () => {
    expect(getMapLibreWorkerUrl("/aurora/")).toBe(
      "/aurora/maplibre/maplibre-gl-worker.mjs",
    );
    expect(getMapLibreSharedUrl("/aurora/")).toBe(
      "/aurora/maplibre/maplibre-gl-shared.mjs",
    );
    expect(getMapLibreWorkerUrl("/aurora")).toBe(
      "/aurora/maplibre/maplibre-gl-worker.mjs",
    );
    expect(getMapLibreSharedUrl("/aurora")).toBe(
      "/aurora/maplibre/maplibre-gl-shared.mjs",
    );
  });

  it("resolves paths with absolute document base URI with trailing slash", () => {
    expect(getMapLibreWorkerUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000/maplibre/maplibre-gl-worker.mjs",
    );
    expect(getMapLibreSharedUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000/maplibre/maplibre-gl-shared.mjs",
    );
    expect(getMapLibreWorkerUrl("http://localhost:3000/aurora/")).toBe(
      "http://localhost:3000/aurora/maplibre/maplibre-gl-worker.mjs",
    );
    expect(getMapLibreSharedUrl("http://localhost:3000/aurora/")).toBe(
      "http://localhost:3000/aurora/maplibre/maplibre-gl-shared.mjs",
    );
  });
});

describe("configureMapLibreWorker", () => {
  it("uses the self-hosted MapLibre v6 worker with provided base URI", () => {
    const setWorkerUrl = vi.fn();

    configureMapLibreWorker({ setWorkerUrl }, "/aurora/");

    expect(setWorkerUrl).toHaveBeenCalledWith(
      "/aurora/maplibre/maplibre-gl-worker.mjs",
    );
  });

  it("does not leak nested page route paths into worker URL when no <base> element exists", () => {
    const setWorkerUrl = vi.fn();

    // Simulate page route at /live-map
    const originalDocument = globalThis.document;
    try {
      globalThis.document = {
        baseURI: "http://localhost:3000/live-map",
        querySelector: vi.fn().mockReturnValue(null),
      } as unknown as Document;

      configureMapLibreWorker({ setWorkerUrl });

      expect(setWorkerUrl).toHaveBeenCalledWith(
        "/maplibre/maplibre-gl-worker.mjs",
      );
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("respects explicit <base href='/aurora/'> element when present", () => {
    const setWorkerUrl = vi.fn();

    const originalDocument = globalThis.document;
    try {
      globalThis.document = {
        baseURI: "http://localhost:3000/aurora/",
        querySelector: vi.fn((selector: string) => {
          if (selector === "base") {
            return {
              getAttribute: (attr: string) => (attr === "href" ? "/aurora/" : null),
              href: "http://localhost:3000/aurora/",
            };
          }
          return null;
        }),
      } as unknown as Document;

      configureMapLibreWorker({ setWorkerUrl });

      expect(setWorkerUrl).toHaveBeenCalledWith(
        "http://localhost:3000/aurora/maplibre/maplibre-gl-worker.mjs",
      );
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
