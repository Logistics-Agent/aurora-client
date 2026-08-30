import type { ComponentProps } from "react";

export function WarehouseIcon({
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
      data-icon="warehouse"
      {...props}
    >
      <path
        d="m3.5 9 8.5-5 8.5 5v10.5h-17V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 12h10M7 15h10M7 18v-3m3 3v-3m4 3v-3m3 3v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
