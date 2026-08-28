export type TrackedShipment = {
  id: string;
  shipmentId: string;
  status: "In transit" | "Delayed" | "At hub" | "GPS stale";
  detail: string;
  markerId: string;
  risk: "low" | "medium" | "high";
  mode: "Road" | "Ocean";
  customer: string;
  region: "SEA" | "Domestic";
};

export type LiveMapFilter = "status" | "mode" | "risk" | "customer" | "region";
