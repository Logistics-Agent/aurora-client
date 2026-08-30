import { Badge } from "@/components/ui/badge";
import type { GeoPoint, LogisticsGeoMarkerMetadata } from "../types";

const statusStyles: Record<string, string> = {
  "At hub": "border-blue-200 bg-blue-50 text-blue-700",
  Delayed: "border-red-200 bg-red-50 text-red-700",
  "GPS stale": "border-amber-200 bg-amber-50 text-amber-700",
  "In transit": "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const riskStyles: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-red-200 bg-red-50 text-red-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
};

function DetailValue({ label, value }: { label: string; value: string }) {
  const styleMap = label === "Status" ? statusStyles : riskStyles;
  const isBadge = label === "Status" || label === "Risk";

  return (
    <div className="min-w-0 border-t border-slate-100 pt-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      {isBadge ? (
        <dd>
          <Badge
            variant="outline"
            className={`mt-1 ${styleMap[value] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}
          >
            {value}
          </Badge>
        </dd>
      ) : (
        <dd className="mt-0.5 truncate text-xs font-medium text-slate-800">
          {value}
        </dd>
      )}
    </div>
  );
}

export function MarkerDetailsFields({
  metadata,
  position,
  heading,
}: {
  metadata?: LogisticsGeoMarkerMetadata;
  position?: GeoPoint;
  heading?: number;
}) {
  const fields = [
    ["Customer", metadata?.customer],
    ["Status", metadata?.status],
    ["Risk", metadata?.risk],
    ["Mode", metadata?.mode],
    ["Region", metadata?.region],
    ["Speed", metadata?.speed],
    ["ETA", metadata?.eta],
    ["Heading", metadata?.heading ?? heading],
    ["Signal", metadata?.signal],
  ].filter((field): field is [string, string | number] => field[1] != null);

  if (!fields.length && !position) return null;

  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
      {fields.map(([label, value]) => (
        <DetailValue key={label} label={label} value={String(value)} />
      ))}
      {position && (
        <DetailValue
          label="Position"
          value={`${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`}
        />
      )}
    </dl>
  );
}
