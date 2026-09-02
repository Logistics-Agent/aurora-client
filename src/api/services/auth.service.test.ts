import { describe, expect, it } from "vitest";
import { authService } from "./auth.service";

describe("auth service placeholder", () => {
  it("builds a login redirect with an encoded return path", () => {
    expect(
      authService.buildLoginRedirectUrl("/dashboard?tab=notifications"),
    ).toBe("/api/v1/auth/login?returnUrl=%2Fdashboard%3Ftab%3Dnotifications");
  });

  it("does not call an Auth API before Auth integration is available", async () => {
    await expect(authService.getCurrentUser()).resolves.toBeNull();
    await expect(authService.logout()).resolves.toBeUndefined();
  });
});
