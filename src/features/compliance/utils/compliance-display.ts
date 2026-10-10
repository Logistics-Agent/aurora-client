export function formatComplianceLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function complianceStatusIntent(value: string) {
  if (["COMPLETED", "LOW", "SUFFICIENT"].includes(value)) return "success" as const;
  if (["PENDING", "PROCESSING", "MEDIUM"].includes(value)) return "warning" as const;
  if (["FAILED", "HIGH", "CRITICAL", "INSUFFICIENT", "CONFLICTING"].includes(value))
    return "critical" as const;
  return "neutral" as const;
}
