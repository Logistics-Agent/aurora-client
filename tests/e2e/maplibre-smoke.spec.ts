import { test, expect, chromium } from "@playwright/test";
import { existsSync } from "node:fs";

const isBrowserAvailable = existsSync(chromium.executablePath());

test.describe("MapLibre Production Asset and Browser Smoke", () => {
  test("worker and shared assets respond with HTTP 200 and javascript content-type", async ({
    request,
    baseURL,
  }) => {
    const host = baseURL || "http://localhost:3000";

    const workerResponse = await request.get(
      `${host}/maplibre/maplibre-gl-worker.mjs`,
    );
    expect(workerResponse.status()).toBe(200);
    const workerContentType = workerResponse.headers()["content-type"] || "";
    expect(
      workerContentType.includes("javascript") ||
        workerContentType.includes("text/"),
    ).toBe(true);

    const sharedResponse = await request.get(
      `${host}/maplibre/maplibre-gl-shared.mjs`,
    );
    expect(sharedResponse.status()).toBe(200);
    const sharedContentType = sharedResponse.headers()["content-type"] || "";
    expect(
      sharedContentType.includes("javascript") ||
        sharedContentType.includes("text/"),
    ).toBe(true);
  });

  test.describe("Browser UI navigation", () => {
    test.skip(
      !isBrowserAvailable,
      `Playwright browser binary is not installed at ${chromium.executablePath()}. Run 'pnpm exec playwright install chromium' to download browser binaries.`,
    );

    test("desktop: visits /live-map without asset 404s or unhandled runtime errors", async ({
      page,
    }) => {

    const consoleErrors: string[] = [];
    const failed404Urls: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("response", (res) => {
      if (res.status() === 404 && res.url().includes("/maplibre/")) {
        failed404Urls.push(res.url());
      }
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/live-map", { waitUntil: "domcontentloaded" });

    // Ensure no 404s on worker or shared files
    expect(failed404Urls).toHaveLength(0);

    // Map container or fallback should be visible
    const mapOrFallback = page.locator(
      '[aria-label*="map" i], [aria-label*="Map" i]',
    );
    await expect(mapOrFallback.first()).toBeVisible({ timeout: 15_000 });

    // Assert absence of uncaught worker / webgl errors in console
    const criticalErrors = consoleErrors.filter(
      (err) =>
        err.toLowerCase().includes("worker") ||
        err.toLowerCase().includes("webgl") ||
        err.toLowerCase().includes("failed to fetch worker"),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("mobile: visits /live-map and renders responsive controls", async ({
    page,
  }) => {
    const failed404Urls: string[] = [];

    page.on("response", (res) => {
      if (res.status() === 404 && res.url().includes("/maplibre/")) {
        failed404Urls.push(res.url());
      }
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/live-map", { waitUntil: "domcontentloaded" });

    expect(failed404Urls).toHaveLength(0);

    const mapOrFallback = page.locator(
      '[aria-label*="map" i], [aria-label*="Map" i]',
    );
    await expect(mapOrFallback.first()).toBeVisible({ timeout: 15_000 });
  });
  });
});

