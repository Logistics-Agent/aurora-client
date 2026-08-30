import { describe, expect, it } from "vitest";
import { getFirebaseMessaging, isFcmSupported } from "./firebase-client";

describe("firebase client", () => {
  it("is disabled when Firebase environment is not enabled", async () => {
    expect(await isFcmSupported()).toBe(false);
    await expect(getFirebaseMessaging()).resolves.toBeNull();
  });
});
