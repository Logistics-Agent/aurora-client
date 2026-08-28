"use client";

import { Box, Layers3, LocateFixed, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapControls({
  trafficVisible,
  restrictionsVisible,
  buildingsVisible,
  buildingsAvailable,
  terrainEnabled,
  onTrafficChange,
  onRestrictionsChange,
  onBuildingsChange,
  onReset,
}: {
  trafficVisible: boolean;
  restrictionsVisible: boolean;
  buildingsVisible: boolean;
  buildingsAvailable: boolean;
  terrainEnabled: boolean;
  onTrafficChange: () => void;
  onRestrictionsChange: () => void;
  onBuildingsChange: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-label="Traffic layer"
        aria-pressed={trafficVisible}
        onClick={onTrafficChange}
        className="bg-white/95"
      >
        <Layers3 /> Traffic
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-label="Restrictions layer"
        aria-pressed={restrictionsVisible}
        onClick={onRestrictionsChange}
        className="bg-white/95"
      >
        <Mountain /> Restrictions
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-label="3D buildings"
        aria-pressed={buildingsVisible}
        disabled={!buildingsAvailable}
        onClick={onBuildingsChange}
        className="bg-white/95"
      >
        <Box /> Buildings
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label="Reset 3D map view"
        onClick={onReset}
        className="bg-white/95"
      >
        <LocateFixed />
      </Button>
      {!terrainEnabled && (
        <span className="sr-only">3D terrain requires a MapTiler key</span>
      )}
    </div>
  );
}
