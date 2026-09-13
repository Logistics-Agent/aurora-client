export const DOCUMENT_TYPE_OPTIONS = [
  { value: "COMMERCIAL_INVOICE", label: "Commercial invoice" },
  { value: "PACKING_LIST", label: "Packing list" },
  { value: "BILL_OF_LADING", label: "Bill of lading" },
  { value: "CUSTOMS_DECLARATION", label: "Customs declaration" },
  { value: "CERTIFICATE_OF_ORIGIN", label: "Certificate of origin" },
  { value: "PROOF_OF_DELIVERY", label: "Proof of delivery" },
  { value: "OTHER", label: "Other" },
] as const;

export type DocumentTypeOptionValue = (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];

export function isDocumentTypeOptionValue(value: string): value is DocumentTypeOptionValue {
  return DOCUMENT_TYPE_OPTIONS.some((option) => option.value === value);
}
