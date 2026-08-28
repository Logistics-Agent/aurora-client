import { MetricCard } from "@/components/common";

export function CommercialSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricCard label="Shipment" value="SHP-2026-00128" />
      <MetricCard label="Estimated cost" value="$18,420" />
      <MetricCard label="Variance" value="+$820 · 4.7%" />
    </div>
  );
}
