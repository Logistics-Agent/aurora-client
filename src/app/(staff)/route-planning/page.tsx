import { Suspense } from "react";
import { RoutePlanningPage } from "@/features/route-tracking";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Route Planning...</div>}>
      <RoutePlanningPage />
    </Suspense>
  );
}

