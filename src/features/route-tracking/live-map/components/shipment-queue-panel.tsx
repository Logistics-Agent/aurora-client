import { RiskBadge, WorkspaceCard } from "@/components/common";
import { liveShipments } from "../mock";
import type {
  LiveMapFilter,
  LiveMapFilterOption,
  LiveMapFilterState,
} from "../types";
import { LiveMapFilters } from "./live-map-filters";

type LiveShipment = (typeof liveShipments)[number];

export type ShipmentQueuePanelProps = {
  shipments: LiveShipment[];
  selectedShipmentId: string;
  onSelect: (shipment: LiveShipment) => void;
  options: readonly LiveMapFilterOption[];
  selectedFilters: LiveMapFilterState;
  onToggle: (filter: LiveMapFilter, value: string) => void;
  onClear: (filter: LiveMapFilter) => void;
  mobileInlineFilters?: boolean;
  className?: string;
};

export function ShipmentQueuePanel({
  shipments,
  selectedShipmentId,
  onSelect,
  options,
  selectedFilters,
  onToggle,
  onClear,
  mobileInlineFilters = false,
  className,
}: ShipmentQueuePanelProps) {
  return (
    <WorkspaceCard
      className={`flex min-h-0 w-full flex-col overflow-hidden bg-white/95 p-3 shadow-xl backdrop-blur-sm sm:p-4 ${className ?? ""}`}
    >
      <div className="mt-3 shrink-0 space-y-2">
        <LiveMapFilters
          options={options}
          selectedFilters={selectedFilters}
          onToggle={onToggle}
          onClear={onClear}
          mobileInline={mobileInlineFilters}
        />
        <p className="text-sm font-semibold">Active shipments</p>
      </div>
      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {shipments.map((shipment) => (
          <button
            type="button"
            key={shipment.id}
            aria-label={`Select shipment ${shipment.id}`}
            onClick={() => onSelect(shipment)}
            className={`w-full rounded-lg p-3 text-left ${selectedShipmentId === shipment.id ? "bg-blue-50 ring-1 ring-primary" : "bg-secondary hover:bg-slate-100"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{shipment.id}</span>
              <RiskBadge level={shipment.risk} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {shipment.status} · {shipment.detail}
            </p>
          </button>
        ))}
        {shipments.length === 0 && (
          <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
            No fixture shipments match this search.
          </p>
        )}
      </div>
    </WorkspaceCard>
  );
}
