"use client";

import dynamic from "next/dynamic";

const LoginEarth = dynamic(
  () => import("@/features/auth/login/components/login-earth"),
  { ssr: false },
);

export function HomeEarth() {
  return (
    <div className="relative h-[300px] w-full min-w-0 sm:h-[380px] lg:h-[480px] [&>div]:h-full [&>div]:w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:touch-pan-y [&_canvas]:cursor-grab [&_canvas]:brightness-[1.18] [&_canvas]:saturate-[.92] dark:[&_canvas]:filter-none">
      <LoginEarth />
    </div>
  );
}
