import type { ComponentProps } from "react";

export function AirplaneIcon({
  width = 20,
  height = 20,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      data-icon="airplane"
      {...props}
    >
      <path d="M11.2 2.7a1 1 0 0 1 1.6 0l1 6.5 5.7 3.2c.45.25.7.74.65 1.25-.05.5-.4.93-.9 1.07l-5.15 1.42-.5 3.42 2.05 1.2c.34.2.54.56.54.95v.55l-4.19-1.05-4.19 1.05v-.55c0-.39.2-.75.54-.95l2.05-1.2-.5-3.42-5.15-1.42a1.25 1.25 0 0 1-.25-2.32l5.7-3.2 1-6.5Z" />
    </svg>
  );
}
