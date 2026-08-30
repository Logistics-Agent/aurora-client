import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  TransportModeIcon,
  type TransportMode,
} from "./transport-mode-icon";
import type { ShipmentStatus } from "./shipment-status-icon";

const statusMarkerStyles: Record<ShipmentStatus, string> = {
  "At hub": "border-blue-500 bg-blue-100 text-blue-700",
  Delayed: "border-red-500 bg-red-100 text-red-700",
  "GPS stale": "border-amber-500 bg-amber-100 text-amber-700",
  "In transit": "border-emerald-500 bg-emerald-100 text-emerald-700",
};

export type ShipmentMarkerIconProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label"
> & {
  mode: TransportMode;
  status: ShipmentStatus;
};

export function ShipmentMarkerIcon({
  mode,
  status,
  className,
  ...props
}: ShipmentMarkerIconProps) {
  return (
    <div
      {...props}
      role="img"
      aria-label={`${mode} shipment, ${status}`}
      data-mode={mode}
      data-status={status}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full border-2 shadow-md",
        statusMarkerStyles[status],
        className,
      )}
    >
      <TransportModeIcon
        mode={mode}
        aria-hidden="true"
        className="size-5"
      />
    </div>
  );
}
