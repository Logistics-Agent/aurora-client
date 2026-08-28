import type { RouteMapFixture } from "../../types";

export type TrackingExceptionState = "normal" | "deviation";

export type GpsTelemetry = {
  shipmentId: string;
  coordinates: string;
  speed: string;
  heading: string;
  lastGps: string;
  eta: string;
  progress: number;
  source: string;
};

export type ShipmentTrackingFixture = {
  map: RouteMapFixture;
  telemetry: GpsTelemetry;
};
