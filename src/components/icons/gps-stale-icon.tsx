import type { ComponentProps } from "react";

export function GpsStaleIcon({
  width = 20,
  height = 20,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-icon="gps-stale"
      {...props}
    >
      <path
        d="M5 9.5a9 9 0 0 1 14 0M8 12a5.5 5.5 0 0 1 8 0M11 14.5a2 2 0 0 1 2 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18.5" r="1.2" fill="currentColor" />
      <path
        d="M19.5 16.5v3M19.5 21.5h.01"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
