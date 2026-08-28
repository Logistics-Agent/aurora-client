import type {
  LogisticsMapMarker,
  LogisticsMapRoute,
} from "@/components/common";

export type CustomerShipmentStatus =
  | "Delayed"
  | "In transit"
  | "On schedule"
  | "Documents ready";

export type CustomerShipmentFilter = "All" | CustomerShipmentStatus;

export type CustomerShipment = {
  id: string;
  fullId: string;
  origin: string;
  destination: string;
  route: string;
  status: CustomerShipmentStatus;
  eta: string;
  lastUpdate: string;
  summary: string;
};

export type CustomerDocument = {
  id: string;
  name: string;
  shipmentId: string;
  format: "PDF";
  state: "Ready to download" | "Needs review" | "Ready";
};

export type CustomerQuote = {
  id: string;
  lane: string;
  amount: string;
  validUntil: string;
  state: "Awaiting confirmation" | "Confirmed" | "Expired";
};

export type CustomerInvoice = {
  id: string;
  shipmentId: string;
  amount: string;
  due: string;
  state: "Pending" | "Paid";
};

export type CustomerNotification = {
  id: string;
  title: string;
  detail: string;
  category: "Shipment" | "Document" | "Billing";
  group: "Today" | "Yesterday";
  read: boolean;
};

export type CustomerPreference = {
  event: string;
  inApp: boolean;
  email: boolean;
};

export type CustomerRouteFixture = {
  routes: LogisticsMapRoute[];
  markers: LogisticsMapMarker[];
};

export type CustomerMilestone = {
  id: string;
  title: string;
  timestamp: string;
  state: "complete" | "attention" | "current";
};

export type CustomerKpi = {
  label: string;
  value: string;
  meta: string;
  tone: "primary" | "success" | "warning" | "ai";
};

export type CustomerTimelineEvent = {
  id: string;
  title: string;
  detail: string;
  state: "complete" | "attention" | "current";
};

export type CustomerAiAnswer = {
  question: string;
  result: string;
  confidence: number;
  reason: string;
  sources: string[];
  timestamp: string;
  suggestedAction: string;
};
