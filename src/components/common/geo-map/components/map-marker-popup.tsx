"use client";

import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogisticsGeoMarker } from "../types";
import { MarkerDetailsFields } from "./marker-details-fields";

type MapMarkerPopupProps = {
  marker: LogisticsGeoMarker;
  position: { left: number; top: number };
  onClose: () => void;
};

export function MapMarkerPopup({
  marker,
  position,
  onClose,
}: MapMarkerPopupProps) {
  return (
    <aside
      aria-label={`Marker details for ${marker.label}`}
      className="pointer-events-auto absolute z-40 max-h-[calc(100%-1.5rem)] w-80 overflow-y-auto rounded-xl border border-border bg-white/95 p-4 text-slate-900 shadow-xl backdrop-blur-sm"
      style={{ left: position.left, top: position.top }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{marker.label}</p>
          {marker.shipmentId && (
            <p className="mt-1 text-xs font-medium text-primary">
              {marker.shipmentId}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close marker details"
          className="-mr-2 -mt-2 size-8 shrink-0"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {marker.detail}
      </p>
      <MarkerDetailsFields
        metadata={marker.metadata}
        position={marker.position}
        heading={marker.heading}
      />
      {marker.shipmentId && (
        <Button asChild size="sm" className="mt-4 w-full">
          <Link href={`/shipments/${marker.shipmentId}`}>
            Open shipment
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      )}
    </aside>
  );
}
