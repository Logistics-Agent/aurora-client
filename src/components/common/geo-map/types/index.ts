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
  coordinates: GeoPoint[];
  kind: LogisticsGeoRouteKind;
  layer?: "traffic" | "restrictions";
};

export type LogisticsGeoMarker = {
  id: string;
  label: string;
  detail: string;
  position: GeoPoint;
  tone: "origin" | "current" | "destination" | "alert";
  shipmentId?: string;
  heading?: number;
};

export type GeoMapAvailability = "available" | "loading" | "unavailable";
