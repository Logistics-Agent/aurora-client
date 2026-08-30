import type { ComponentProps } from "react";

export function NavigationIcon({
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
      data-icon="navigation"
      {...props}
    >
      <path
        d="m12 3.5 4.2 16.7-4.2-3-4.2 3L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m10.1 13.2 3.8-1.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
