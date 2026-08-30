export type GeoPoint = {
  longitude: number;
  latitude: number;
};

export type LogisticsGeoRouteKind =
  | "planned"
  | "completed"
  | "current"
  | "alternative"
  | "risk";

export type LogisticsGeoRoute = {
  id: string;
  label: string;
  shipmentId?: string;
  coordinates: GeoPoint[];
  kind: LogisticsGeoRouteKind;
  layer?: "operations" | "traffic" | "restrictions";
};

export type LogisticsGeoMarkerMetadata = {
  customer?: string;
  eta?: string;
  heading?: number | string;
  mode?: string;
  region?: string;
  risk?: "low" | "medium" | "high" | "critical";
  signal?: string;
  speed?: string;
  status?: string;
};

export type LogisticsGeoMarker = {
  id: string;
  label: string;
  detail: string;
  position: GeoPoint;
  tone: "origin" | "current" | "destination" | "alert";
  shipmentId?: string;
  heading?: number;
  metadata?: LogisticsGeoMarkerMetadata;
};

export type GeoMapAvailability = "available" | "loading" | "unavailable";
