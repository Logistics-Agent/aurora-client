import { describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { authService, getInvitationSession } from "./auth.service";
import { ApiError } from "@/lib/api-error";

describe("auth service", () => {
  it("extracts the Cognito session from an invitation-completion conflict", () => {
    const error = new ApiError({
      message: "Complete invitation",
      status: 409,
      details: { requiresInvitationCompletion: true, session: "cognito-session" },
    });

    expect(getInvitationSession(error)).toBe("cognito-session");
  });

  it("does not treat an unrelated conflict as an invitation challenge", () => {
    const error = new ApiError({ message: "Conflict", status: 409, details: {} });
    expect(getInvitationSession(error)).toBeNull();
  });
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

  it("returns parsed user profile when /api/v1/auth/me succeeds", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      userId: "usr-123",
      tenantId: "tnt-456",
      email: "staff@acmelogistics.com",
      name: "Staff User",
      role: "Staff",
      permissions: ["route_planning:read", "route_planning:create"],
      isAuthenticated: true,
    });

    const profile = await authService.getCurrentUser();
    expect(profile).not.toBeNull();
    expect(profile?.email).toBe("staff@acmelogistics.com");
    expect(profile?.role).toBe("STAFF");
    expect(profile?.permissions).toContain("route_planning:read");
  });

  it("returns null when /api/v1/auth/me fails (unauthenticated)", async () => {
    vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Unauthorized"));
    const profile = await authService.getCurrentUser();
    expect(profile).toBeNull();
  });
});
