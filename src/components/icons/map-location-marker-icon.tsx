import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { DelayedIcon } from "./delayed-icon";
import { NavigationIcon } from "./navigation-icon";
import { WarehouseIcon } from "./warehouse-icon";

export type MapLocationMarkerTone =
  | "origin"
  | "current"
  | "destination"
  | "alert";

export type MapLocationMarkerIconProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label"
> & {
  tone: MapLocationMarkerTone;
};

const locationMarkerStyles: Record<MapLocationMarkerTone, string> = {
  origin: "border-emerald-500 bg-emerald-100 text-emerald-700",
  current: "border-blue-500 bg-blue-100 text-blue-700",
  destination: "border-violet-500 bg-violet-100 text-violet-700",
  alert: "border-red-500 bg-red-100 text-red-700",
};

function LocationIcon({ tone }: { tone: MapLocationMarkerTone }) {
  if (tone === "origin") {
    return <WarehouseIcon aria-hidden="true" className="size-5" />;
  }

  if (tone === "alert") {
    return <DelayedIcon aria-hidden="true" className="size-5" />;
  }

  return (
    <NavigationIcon
      aria-hidden="true"
      className={cn("size-5", tone === "destination" && "rotate-180")}
    />
  );
}

export function MapLocationMarkerIcon({
  tone,
  className,
  ...props
}: MapLocationMarkerIconProps) {
  return (
    <div
      {...props}
      role="img"
      aria-label={`${tone} map location`}
      data-tone={tone}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full border-2 shadow-md",
        locationMarkerStyles[tone],
        className,
      )}
    >
      <LocationIcon tone={tone} />
    </div>
  );
}
