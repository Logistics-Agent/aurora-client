import type { GeoPoint } from "@/components/common";

export type TrackedShipment = {
  id: string;
  shipmentId: string;
  status: "In transit" | "Delayed" | "At hub" | "GPS stale";
  detail: string;
  markerId: string;
  risk: "low" | "medium" | "high" | "critical";
  mode: "Road" | "Ocean" | "Air";
  customer: string;
  position: GeoPoint;
  eta?: string;
  heading?: number;
  lastUpdated?: string;
  region: "SEA" | "Domestic";
  speed?: string;
};

export type LiveMapFilter = "status" | "mode" | "risk" | "customer" | "region";

export type LiveMapFilterOptionValue = {
  value: string;
  label: string;
};

export type LiveMapFilterOption = {
  key: LiveMapFilter;
  label: string;
  values: readonly LiveMapFilterOptionValue[];
};

export type LiveMapFilterValue = {
  status: TrackedShipment["status"];
  mode: TrackedShipment["mode"];
  risk: TrackedShipment["risk"];
  customer: TrackedShipment["customer"];
  region: TrackedShipment["region"];
};

export type LiveMapFilterState = {
  [Key in LiveMapFilter]: LiveMapFilterValue[Key][];
};
