import type { DocumentStatus } from "@/dto/documents/document.dto";

export function documentStatusLabel(status: DocumentStatus["status"]) {
  switch (status) {
    case "READY":
    case "VERIFIED":
      return "Verified";
    case "NEEDS_REVIEW":
      return "Needs review";
    case "FAILED":
      return "Failed";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Processing";
  }
}

export function documentStatusIntent(status: DocumentStatus["status"]) {
  switch (status) {
    case "READY":
    case "VERIFIED":
      return "success" as const;
    case "FAILED":
    case "REJECTED":
      return "critical" as const;
    case "NEEDS_REVIEW":
      return "warning" as const;
    default:
      return "ai" as const;
  }
}
