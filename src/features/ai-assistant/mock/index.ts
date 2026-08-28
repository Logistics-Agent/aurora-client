// UI-only fixture until backend integration phase.
export type AiAnswerMock = {
  result: string;
  confidence: number;
  reason: string;
  sources: string[];
  suggestedAction: string;
};

export const shipmentRiskInsight: AiAnswerMock = {
  result: "Port congestion may add 55–80 minutes to SHP-2026-00128.",
  confidence: 87,
  reason:
    "Berth queue increased 34% and the vessel missed its original window.",
  sources: ["Port feed", "Vessel schedule"],
  suggestedAction: "Review alternative arrival slot · human approval required",
};

export const assistantAnswerMock: AiAnswerMock = {
  result:
    "SHP-2026-00128 is currently near Cat Lai Port with an ETA buffer of 35 minutes.",
  confidence: 91,
  reason:
    "The visible shipment timeline and route context show a port congestion flag.",
  sources: ["Shipment timeline", "Route context"],
  suggestedAction: "Open shipment detail",
};
