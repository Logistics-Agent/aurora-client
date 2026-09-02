import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("frontend environment", () => {
  it("loads with Firebase disabled and empty public Firebase values", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_ENABLED = "false";
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "";
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "";
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "";
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = "";

    const { env } = await import("./env.config");

    expect(env.firebase).toEqual({
      enabled: false,
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      vapidKey: "",
    });
  });

  it("loads all Firebase public settings when Firebase is enabled", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_ENABLED = "true";
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "public-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "aurora.firebaseapp.com";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "aurora";
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "aurora.firebasestorage.app";
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "app-id";
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = "public-vapid-key";

    const { env } = await import("./env.config");

    expect(env.firebase.enabled).toBe(true);
    expect(env.firebase.projectId).toBe("aurora");
    expect(env.firebase.vapidKey).toBe("public-vapid-key");
  });

  it("rejects enabled Firebase when a required public value is missing", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_ENABLED = "true";
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "";

    await expect(import("./env.config")).rejects.toThrow(/apiKey/);
  });
});
