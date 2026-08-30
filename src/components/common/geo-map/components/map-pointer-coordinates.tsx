import type { GeoPoint } from "../types";

function formatDegrees(value: number, positive: string, negative: string) {
  const absoluteValue = Math.abs(value);
  const degrees = Math.floor(absoluteValue);
  const minutes = ((absoluteValue - degrees) * 60).toFixed(2);
  const direction = value >= 0 ? positive : negative;

  return `${degrees}° ${minutes}' ${direction}`;
}

export function MapPointerCoordinates({
  coordinates,
}: {
  coordinates: GeoPoint | null;
}) {
  if (!coordinates) return null;

  return (
    <div
      role="status"
      aria-label="Pointer coordinates"
      className="pointer-events-none absolute bottom-7 right-14 z-40 min-w-40 rounded-lg bg-slate-900/80 px-4 py-3 text-right font-mono text-xs leading-5 text-white shadow-lg backdrop-blur-sm"
    >
      <p>
        {formatDegrees(coordinates.latitude, "N", "S")}
      </p>
      <p>
        {formatDegrees(coordinates.longitude, "E", "W")}
      </p>
      <p className="text-slate-300">
        ({coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)})
      </p>
    </div>
  );
}
