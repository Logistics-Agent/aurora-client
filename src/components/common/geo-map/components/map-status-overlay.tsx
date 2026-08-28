import { Box, Mountain, Radio } from "lucide-react";

export type MapRenderMode =
  | "vector-3d"
  | "vector"
  | "vector-lite-3d"
  | "vector-lite"
  | "svg";

const modeLabels: Record<MapRenderMode, string> = {
  "vector-3d": "Real vector map · 3D buildings",
  vector: "Real vector map · 3D unavailable",
  "vector-lite-3d": "Real vector map · resilient 3D style",
  "vector-lite": "Real vector map · resilient style",
  svg: "SVG capability fallback",
};

export function MapStatusOverlay({
  terrainEnabled,
  mode,
}: {
  terrainEnabled: boolean;
  mode: MapRenderMode;
}) {
  return (
    <div className="absolute bottom-3 left-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 text-[11px]">
      <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 font-medium text-slate-700 shadow-sm">
        <Box className="size-3" />
        {modeLabels[mode]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-slate-600 shadow-sm">
        <Mountain className="size-3" />
        {mode === "vector-lite" || mode === "vector-lite-3d"
          ? "Terrain unavailable in resilient mode"
          : terrainEnabled
            ? "Terrain enabled"
            : "Terrain key not configured"}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50/95 px-2.5 py-1 font-medium text-blue-800 shadow-sm">
        <Radio className="size-3" /> Simulated telemetry
      </span>
    </div>
  );
}
