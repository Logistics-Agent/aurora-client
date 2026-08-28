// UI-only fixture until backend integration phase.
export const tenantMocks = [
  ["AC", "ACME Logistics", "Vietnam Operations", "Live · 284 shipments"],
  ["NO", "NorthStar Freight", "APAC Control Tower", "12 active exceptions"],
  ["HA", "HarborLink", "Customer Portal", "Read-only access"],
] as const;

export function authenticateMock(
  email: string,
  password: string,
): "success" | "error" {
  return email === "ops@acmelogistics.com" && password === "password"
    ? "success"
    : "error";
}
