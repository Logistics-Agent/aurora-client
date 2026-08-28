// UI-only fixture until backend integration phase.
export type DocumentMock = {
  id: string;
  name: string;
  shipmentId: string;
  state: "Verified" | "Needs review" | "Processing";
  confidence?: number;
};

export const documentMocks: DocumentMock[] = [
  {
    id: "BOL-2848",
    name: "Bill of Lading",
    shipmentId: "SHP-2026-00128",
    state: "Verified",
    confidence: 98,
  },
  {
    id: "INV-2026-0048",
    name: "Commercial invoice",
    shipmentId: "SHP-2026-00128",
    state: "Needs review",
    confidence: 72,
  },
  {
    id: "PKL-2848",
    name: "Packing list",
    shipmentId: "SHP-2026-00128",
    state: "Processing",
  },
];

export const ocrFieldMocks = [
  { label: "Container number", value: "MSCU-2848128", confidence: "98%" },
  { label: "Port of discharge", value: "Singapore", confidence: "72%" },
  { label: "Gross weight", value: "18,420 kg", confidence: "99%" },
] as const;

export function approveDocument(document: DocumentMock): DocumentMock {
  return {
    ...document,
    state: "Verified",
    confidence: document.confidence ?? 100,
  };
}
