import { describe, expect, it } from "vitest";

import { hasMailPermission } from "./mail-permissions";

const staff = {
  userId: "staff-01",
  tenantId: "tenant-01",
  email: "staff@guardm.space",
  name: "Staff",
  role: "STAFF" as const,
  permissions: ["mail:read"],
  isAuthenticated: true,
};

describe("hasMailPermission", () => {
  it("does not widen mail:read into supervisory or security permissions", () => {
    expect(hasMailPermission(staff, "mail:read")).toBe(true);
    expect(hasMailPermission(staff, "mail:thread:read_all")).toBe(false);
    expect(hasMailPermission(staff, "mail:quarantine:release")).toBe(false);
  });

  it("accepts explicit manager capabilities", () => {
    const manager = { ...staff, role: "MANAGER" as const, permissions: ["mail:thread:reassign"] };
    expect(hasMailPermission(manager, "mail:thread:reassign")).toBe(true);
    expect(hasMailPermission(manager, "mail:thread:unassign")).toBe(false);
  });
});
