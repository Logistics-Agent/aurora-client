import type { ComponentProps } from "react";
import { DelayedIcon } from "./delayed-icon";
import { GpsStaleIcon } from "./gps-stale-icon";
import { NavigationIcon } from "./navigation-icon";
import { WarehouseIcon } from "./warehouse-icon";

export type ShipmentStatus = "In transit" | "Delayed" | "At hub" | "GPS stale";

export type ShipmentStatusIconProps = ComponentProps<"svg"> & {
  status: ShipmentStatus;
};

export function ShipmentStatusIcon({
  status,
  className,
  "aria-label": ariaLabel,
  ...props
}: ShipmentStatusIconProps) {
  const iconProps = {
    ...props,
    className,
    "aria-label": ariaLabel ?? `${status} shipment status`,
  };

  if (status === "Delayed") return <DelayedIcon {...iconProps} />;
  if (status === "GPS stale") return <GpsStaleIcon {...iconProps} />;
  if (status === "At hub") return <WarehouseIcon {...iconProps} />;
  return <NavigationIcon {...iconProps} />;
}
