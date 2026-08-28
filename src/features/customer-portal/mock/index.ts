import type {
  CustomerAiAnswer,
  CustomerDocument,
  CustomerInvoice,
  CustomerKpi,
  CustomerMilestone,
  CustomerNotification,
  CustomerPreference,
  CustomerQuote,
  CustomerRouteFixture,
  CustomerShipment,
  CustomerTimelineEvent,
} from "../types";

// UI-only fixture until backend integration phase.
export const customerKpis: CustomerKpi[] = [
  {
    label: "Active shipments",
    value: "12",
    meta: "Updated moments ago",
    tone: "primary",
  },
  {
    label: "On time",
    value: "9",
    meta: "Updated moments ago",
    tone: "success",
  },
  {
    label: "Needs attention",
    value: "2",
    meta: "Updated moments ago",
    tone: "warning",
  },
  {
    label: "Documents ready",
    value: "34",
    meta: "Updated moments ago",
    tone: "ai",
  },
];

// UI-only fixture until backend integration phase.
export const customerShipmentMocks: CustomerShipment[] = [
  {
    id: "SHP-128",
    fullId: "SHP-2026-00128",
    origin: "Ho Chi Minh City",
    destination: "Singapore",
    route: "HCM → Singapore",
    status: "Delayed",
    eta: "Today 14:35",
    lastUpdate: "18 min ago",
    summary: "Port congestion advisory",
  },
  {
    id: "SHP-124",
    fullId: "SHP-2026-00124",
    origin: "Da Nang",
    destination: "Busan",
    route: "Da Nang → Busan",
    status: "In transit",
    eta: "26 Aug",
    lastUpdate: "32 min ago",
    summary: "On schedule",
  },
  {
    id: "SHP-119",
    fullId: "SHP-2026-00119",
    origin: "Ho Chi Minh City",
    destination: "Rotterdam",
    route: "HCM → Rotterdam",
    status: "On schedule",
    eta: "29 Aug",
    lastUpdate: "1 hr ago",
    summary: "On schedule",
  },
  {
    id: "SHP-114",
    fullId: "SHP-2026-00114",
    origin: "Hai Phong",
    destination: "Los Angeles",
    route: "Hai Phong → LA",
    status: "Documents ready",
    eta: "02 Sep",
    lastUpdate: "2 hr ago",
    summary: "Documents ready",
  },
];

// UI-only fixture until backend integration phase.
export const customerDocumentMocks: CustomerDocument[] = [
  {
    id: "DOC-BOL-128",
    name: "Bill of Lading",
    shipmentId: "SHP-128",
    format: "PDF",
    state: "Ready to download",
  },
  {
    id: "DOC-INV-128",
    name: "Commercial Invoice",
    shipmentId: "SHP-128",
    format: "PDF",
    state: "Needs review",
  },
  {
    id: "DOC-PKL-128",
    name: "Packing List",
    shipmentId: "SHP-128",
    format: "PDF",
    state: "Ready",
  },
];

// UI-only fixture until backend integration phase.
export const customerQuoteMocks: CustomerQuote[] = [
  {
    id: "Q-2026-014",
    lane: "HCM → Singapore",
    amount: "USD 4,280",
    validUntil: "31 Aug",
    state: "Awaiting confirmation",
  },
  {
    id: "Q-2026-011",
    lane: "Da Nang → Busan",
    amount: "USD 2,140",
    validUntil: "24 Aug",
    state: "Confirmed",
  },
];

// UI-only fixture until backend integration phase.
export const customerInvoiceMocks: CustomerInvoice[] = [
  {
    id: "INV-2208",
    shipmentId: "SHP-128",
    amount: "USD 4,280",
    due: "Due 31 Aug",
    state: "Pending",
  },
  {
    id: "INV-2199",
    shipmentId: "SHP-124",
    amount: "USD 2,140",
    due: "Paid 23 Aug",
    state: "Paid",
  },
];

// UI-only fixture until backend integration phase.
export const customerTimelineMocks: CustomerTimelineEvent[] = [
  {
    id: "timeline-1",
    title: "Container departed Cat Lai",
    detail: "24 Aug · 09:12",
    state: "complete",
  },
  {
    id: "timeline-2",
    title: "Port congestion advisory",
    detail: "24 Aug · 12:03 · customer notified",
    state: "attention",
  },
  {
    id: "timeline-3",
    title: "Updated ETA: Today, 14:35",
    detail: "Latest carrier-visible milestone",
    state: "current",
  },
];

// UI-only fixture until backend integration phase.
export const customerTrackingMapMock: CustomerRouteFixture = {
  routes: [
    {
      id: "customer-visible-route",
      label: "Customer-visible shipment route",
      path: "M120 250 C280 220 490 230 680 205",
      kind: "planned",
    },
  ],
  markers: [
    {
      id: "customer-origin",
      label: "Cat Lai",
      detail: "Departed 24 Aug · 09:12",
      x: 18,
      y: 56,
      tone: "origin",
    },
    {
      id: "customer-destination",
      label: "Singapore",
      detail: "ETA today · 14:35",
      x: 83,
      y: 48,
      tone: "alert",
    },
  ],
};

// UI-only fixture until backend integration phase.
export const customerMilestoneMocks: CustomerMilestone[] = [
  {
    id: "milestone-1",
    title: "Departed origin",
    timestamp: "24 Aug · 09:12",
    state: "complete",
  },
  {
    id: "milestone-2",
    title: "Port congestion advisory",
    timestamp: "24 Aug · 12:03",
    state: "attention",
  },
  {
    id: "milestone-3",
    title: "ETA updated",
    timestamp: "Today · 14:35",
    state: "current",
  },
];

// UI-only fixture until backend integration phase.
export const customerTrackingTelemetry = {
  status: "GPS stale",
  lastUpdate: "18 minutes ago",
  advisory: "ETA +24 min · customer notified",
  progress: 62,
} as const;

// UI-only fixture until backend integration phase.
export const customerAssistantMock: CustomerAiAnswer = {
  question: "Why is SHP-128 delayed?",
  result: "The latest ETA is 14:35 today.",
  confidence: 89,
  reason:
    "The carrier reported port congestion at Cat Lai and the customer-visible ETA changed.",
  sources: ["Carrier milestone", "Shipment timeline"],
  timestamp: "Today · 12:03 ICT",
  suggestedAction: "Open shipment or view tracking",
};

// UI-only fixture until backend integration phase.
export const customerNotificationMocks: CustomerNotification[] = [
  {
    id: "NTF-1",
    title: "SHP-128 ETA updated",
    detail: "Today 12:03",
    category: "Shipment",
    group: "Today",
    read: false,
  },
  {
    id: "NTF-2",
    title: "Commercial Invoice needs review",
    detail: "Today 09:18",
    category: "Document",
    group: "Today",
    read: false,
  },
  {
    id: "NTF-3",
    title: "SHP-124 departed origin",
    detail: "Yesterday 17:42",
    category: "Shipment",
    group: "Yesterday",
    read: true,
  },
  {
    id: "NTF-4",
    title: "Invoice INV-2199 paid",
    detail: "Yesterday 14:10",
    category: "Billing",
    group: "Yesterday",
    read: true,
  },
];

// UI-only fixture until backend integration phase.
export const customerPreferenceMocks: CustomerPreference[] = [
  { event: "Shipment milestones", inApp: true, email: true },
  { event: "Document updates", inApp: true, email: false },
  { event: "Invoice updates", inApp: true, email: true },
];
