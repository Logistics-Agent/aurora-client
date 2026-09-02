import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("Firebase messaging service worker route", () => {
  afterEach(() => {
    vi.doUnmock("@/configs");
    vi.resetModules();
  });

  it("returns a safe no-op script when Firebase is disabled", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "application/javascript",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    const script = await response.text();
    const forbiddenMarkers = [
      "private" + "_key",
      "client" + "_email",
      "service" + "Account",
      "ServiceAuth" + "__ApiKey",
    ];

    for (const marker of forbiddenMarkers) {
      expect(script).not.toContain(marker);
    }
  });

  it("protects enabled background clicks with the internal path allowlist", async () => {
    vi.doMock("@/configs", () => ({
      env: {
        firebase: {
          enabled: true,
          apiKey: "public-api-key",
          authDomain: "aurora.firebaseapp.com",
          projectId: "aurora",
          storageBucket: "aurora.firebasestorage.app",
          messagingSenderId: "123456",
          appId: "app-id",
          vapidKey: "public-vapid-key",
        },
      },
    }));
    const { GET: getEnabledRoute } = await import("./route");
    const response = await getEnabledRoute();
    const script = await response.text();

    expect(script.indexOf("notificationclick")).toBeLessThan(
      script.indexOf("importScripts"),
    );
    expect(script).toContain("fcmMessage.fcmOptions");
    expect(script).toContain("safePath = '/notifications'");
  });
});
