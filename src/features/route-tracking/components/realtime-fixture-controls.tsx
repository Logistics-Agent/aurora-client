"use client";

import { Radio, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RouteMapAvailability, RouteRealtimeState } from "../types";
import { nextMapAvailability, nextRealtimeState } from "../utils/fixture-state";

export function RealtimeFixtureControls({
  realtimeState,
  mapAvailability,
  onRealtimeStateChange,
  onMapAvailabilityChange,
}: {
  realtimeState: RouteRealtimeState;
  mapAvailability: RouteMapAvailability;
  onRealtimeStateChange: (state: RouteRealtimeState) => void;
  onMapAvailabilityChange: (state: RouteMapAvailability) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onMapAvailabilityChange(nextMapAvailability(mapAvailability))
        }
        aria-label={`Cycle map state, currently ${mapAvailability}`}
      >
        <Satellite className="size-4" />
        Map · {mapAvailability}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onRealtimeStateChange(nextRealtimeState(realtimeState))}
      >
        <Radio className="size-4" />
        Cycle signal
      </Button>
    </div>
  );
}
