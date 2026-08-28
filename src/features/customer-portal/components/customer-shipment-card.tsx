import { StatusBadge } from "@/components/common";
import type { CustomerShipment } from "../types";

function statusIntent(status: CustomerShipment["status"]) {
  if (status === "Delayed") return "warning" as const;
  if (status === "Documents ready") return "ai" as const;
  return "success" as const;
}

export function CustomerShipmentCard({
  shipment,
  selected,
  onSelect,
}: {
  shipment: CustomerShipment;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Select ${shipment.id}`}
      aria-pressed={selected}
      onClick={onSelect}
      className={`grid w-full gap-2 border-t border-border px-4 py-4 text-left transition-colors md:grid-cols-[1.05fr_1.1fr_1fr_0.8fr_0.8fr] md:items-center ${selected ? "bg-blue-50" : "bg-card hover:bg-secondary"}`}
    >
      <div className="flex items-center justify-between gap-3 md:block">
        <span className="font-semibold">{shipment.id}</span>
        <span className="md:hidden">
          <StatusBadge
            label={shipment.status}
            intent={statusIntent(shipment.status)}
          />
        </span>
      </div>
      <span className="text-sm text-muted-foreground">{shipment.route}</span>
      <span className="hidden md:block">
        <StatusBadge
          label={shipment.status}
          intent={statusIntent(shipment.status)}
        />
      </span>
      <span className="text-xs text-muted-foreground md:text-sm">
        {shipment.eta}
      </span>
      <span className="text-xs text-muted-foreground">
        {shipment.lastUpdate}
      </span>
    </button>
  );
}
