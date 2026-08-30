import { describe, expect, it } from "vitest";
import {
  createFirebaseServiceWorkerScript,
  createNoopServiceWorkerScript,
} from "./firebase-service-worker";

describe("Firebase service worker script", () => {
  it("creates a safe no-op worker when Firebase is disabled", () => {
    expect(createNoopServiceWorkerScript()).toContain("skipWaiting");
  });

  it("embeds only public Firebase configuration", () => {
    const script = createFirebaseServiceWorkerScript({
      apiKey: "public-api-key",
      appId: "app-id",
      authDomain: "aurora.firebaseapp.com",
      messagingSenderId: "123456",
      projectId: "aurora",
      storageBucket: "aurora.firebasestorage.app",
    });

    expect(script).toContain("firebase-app-compat.js");
    expect(script).toContain('apiKey":"public-api-key"');
    expect(script).toContain("safePath = '/notifications'");
    expect(script).not.toContain("private_key");
    expect(script).not.toContain("client_email");
    expect(script).not.toContain("serviceAccount");
  });
});
