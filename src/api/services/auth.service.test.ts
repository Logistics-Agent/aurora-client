import { describe, expect, it } from "vitest";
import { authService } from "./auth.service";

describe("auth service", () => {
  it("builds a login redirect with an absolute encoded return path", () => {
    const url = authService.buildLoginRedirectUrl("/dashboard?tab=notifications");
    expect(url).toContain("/api/v1/auth/login?returnUrl=");
    expect(url).toContain(encodeURIComponent("/dashboard?tab=notifications"));
  });

  it("preserves full absolute return URLs", () => {
    const url = authService.buildLoginRedirectUrl("https://humanak.cyou/overview");
    expect(url).toBe(
      "/api/v1/auth/login?returnUrl=" +
        encodeURIComponent("https://humanak.cyou/overview"),
    );
  });

  it("does not call an Auth API before Auth integration is available", async () => {
    await expect(authService.getCurrentUser()).resolves.toBeNull();
    await expect(authService.logout()).resolves.toBeUndefined();
  });
});
