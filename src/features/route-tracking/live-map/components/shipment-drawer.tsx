import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrackedShipment } from "../types";

export function ShipmentDrawer({
  shipment,
  onClose,
  className,
}: {
  shipment: TrackedShipment;
  onClose: () => void;
  className?: string;
}) {
  return (
    <aside aria-label="Selected shipment details" className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{shipment.id}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {shipment.status} · {shipment.detail}
          </p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Close shipment details"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Fixture position only. No live GPS transport is connected.
      </p>
      <Button asChild className="mt-4 w-full">
        <Link
          href={`/shipments/${shipment.shipmentId}`}
          aria-label={`Open shipment ${shipment.id}`}
        >
          Open shipment
          <ExternalLink className="size-4" />
        </Link>
      </Button>
    </aside>
  );
}
