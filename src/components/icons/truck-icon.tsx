import type { ComponentProps } from "react";

export function TruckIcon({
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
      data-icon="truck"
      {...props}
    >
      <path
        d="M3.5 6.5h10v10h-10z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 9h3.2l3.8 4v3.5h-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.7 9v4h3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 16.5H5.2M8.8 16.5h6.9M19.3 16.5h1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
