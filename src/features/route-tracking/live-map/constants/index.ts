import { liveShipments } from "../mock";
import type { LiveMapFilterOption, LiveMapFilterState } from "../types";

export const LIVE_MAP_FILTER_OPTIONS: readonly LiveMapFilterOption[] = [
  {
    key: "status",
    label: "Status",
    values: [
      { value: "In transit", label: "In transit" },
      { value: "Delayed", label: "Delayed" },
      { value: "At hub", label: "At hub" },
      { value: "GPS stale", label: "GPS stale" },
    ],
  },
  {
    key: "mode",
    label: "Mode",
    values: [
      { value: "Road", label: "Road" },
      { value: "Ocean", label: "Ocean" },
      { value: "Air", label: "Air" },
    ],
  },
  {
    key: "risk",
    label: "Risk",
    values: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  {
    key: "customer",
    label: "Customer",
    values: Array.from(
      new Set(liveShipments.map((shipment) => shipment.customer)),
    )
      .sort()
      .map((value) => ({ value, label: value })),
  },
  {
    key: "region",
    label: "Region",
    values: [
      { value: "SEA", label: "SEA" },
      { value: "Domestic", label: "Domestic" },
    ],
  },
];

export const EMPTY_LIVE_MAP_FILTERS: LiveMapFilterState = {
  status: [],
  mode: [],
  risk: [],
  customer: [],
  region: [],
};
