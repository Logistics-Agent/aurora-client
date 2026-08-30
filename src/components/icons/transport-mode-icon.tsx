import type { ComponentProps } from "react";
import { AirplaneIcon } from "./airplane-icon";
import { ShipIcon } from "./ship-icon";
import { TruckIcon } from "./truck-icon";

export type TransportMode = "Road" | "Ocean" | "Air";

export type TransportModeIconProps = ComponentProps<"svg"> & {
  mode: TransportMode;
};

export function TransportModeIcon({
  mode,
  "aria-label": ariaLabel,
  ...props
}: TransportModeIconProps) {
  const label = ariaLabel ?? `${mode} transport`;

  if (mode === "Air") return <AirplaneIcon aria-label={label} {...props} />;
  if (mode === "Ocean") return <ShipIcon aria-label={label} {...props} />;
  return <TruckIcon aria-label={label} {...props} />;
}
