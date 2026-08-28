// UI-only fixture until backend integration phase.
export type UserMock = {
  id: string;
  name: string;
  role: string;
  state: "Active" | "Suspended";
};

export const userMocks: UserMock[] = [
  { id: "USR-01", name: "An Nguyen", role: "Operations", state: "Active" },
  { id: "USR-02", name: "Mai Tran", role: "Compliance", state: "Active" },
  { id: "USR-03", name: "Long Pham", role: "Finance", state: "Suspended" },
];

export const permissionMatrixMocks = [
  ["View shipments", "Allowed", "Allowed", "Allowed", "Allowed"],
  ["Approve negotiation", "Restricted", "Allowed", "Restricted", "Restricted"],
  ["Resolve compliance", "Restricted", "Restricted", "Allowed", "Restricted"],
  ["AI operations", "Hidden", "Hidden", "Hidden", "Allowed"],
] as const;

// UI-only fixture until backend integration phase.
export const adminRecordMocks = [
  {
    id: "AIO-1048",
    record: "Route recommendation",
    actor: "A. Nguyen",
    state: "Approved",
  },
  {
    id: "AIO-1047",
    record: "OCR field edit",
    actor: "M. Tran",
    state: "Needs review",
  },
  {
    id: "AIO-1046",
    record: "Payment record",
    actor: "L. Pham",
    state: "Pending",
  },
] as const;

export function toggleUserState(user: UserMock): UserMock {
  return { ...user, state: user.state === "Active" ? "Suspended" : "Active" };
}
