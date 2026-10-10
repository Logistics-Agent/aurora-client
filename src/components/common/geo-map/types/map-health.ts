export type MapHealthState =
  | "checking"
  | "ready"
  | "worker-error"
  | "style-error"
  | "tile-error"
  | "webgl-error";

export type ClassifiedMapLibreError =
  | "style-error"
  | "tile-error"
  | "worker-error"
  | "unknown";
