import type { LogisticsGeoMarker, LogisticsGeoRoute } from "@/components/common";

export type RouteStopType =
  | "Pickup"
  | "Delivery"
  | "Warehouse"
  | "Hub"
  | "Port"
  | "Customs";

export type RouteStopItem = {
  id: string;
  sequence: number;
  stopType: RouteStopType;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalMinutes?: number;
  serviceDurationMinutes?: number;
};

export type RouteAlternative = {
  id: string;
  name: string;
  distance: string;
  distanceKm: number;
  duration: string;
  durationMinutes: number;
  cost: string;
  costValue: number;
  risk: "Low" | "Medium" | "High";
  governanceDecision: "NoApprovalRequired" | "StaffAllowed" | "ManagerApprovalRequired";
  recommended: boolean;
  co2EmissionsKg?: number;
  tollFees?: string;
  tag?: "AI Recommended" | "Fastest ETA" | "Lowest Cost" | "Alternative";
  stops: RouteStopItem[];
  coordinates: Array<{ longitude: number; latitude: number }>;
};

export type ShipmentPlanningItem = {
  id: string;
  shipmentNo: string;
  orderId: string;
  customerName: string;
  priority: "Normal" | "High" | "Urgent";
  status: "Planning" | "Draft" | "Submitted" | "In Transit";
  transportMode: "Road" | "Ocean" | "Air" | "Multimodal";
  cargo: {
    commodity: string;
    weightKg: number;
    volumeM3: number;
    packageType: string;
    temperatureControlled?: boolean;
    temperatureRange?: string;
  };
  origin: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    contactName?: string;
    contactPhone?: string;
  };
  destination: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    contactName?: string;
    contactPhone?: string;
  };
  waypoints: RouteStopItem[];
  routes: RouteAlternative[];
  mapRoutes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
  assignedRouteId?: string;
  aiRecommendation: {
    recommendedRouteId: string;
    confidence: number;
    summary: string;
    reason: string;
    sources: string[];
    suggestedAction: string;
  };
};

export type CreateShipmentInput = {
  orderId: string;
  customerName: string;
  priority: "Normal" | "High" | "Urgent";
  transportMode: "Road" | "Ocean" | "Air" | "Multimodal";
  commodity: string;
  weightKg: number;
  volumeM3: number;
  packageType: string;
  temperatureControlled: boolean;
  temperatureRange?: string;
  originName: string;
  originAddress: string;
  originLat: number;
  originLng: number;
  destName: string;
  destAddress: string;
  destLat: number;
  destLng: number;
};

export type FacilityPreset = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  type: RouteStopType;
};

export type CustomStopDraft = {
  id: string;
  sequence: number;
  stopType: RouteStopType;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceDurationMinutes: number;
};


