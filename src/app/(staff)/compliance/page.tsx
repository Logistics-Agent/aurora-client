import { Suspense } from "react";
import { CompliancePage } from "@/features/compliance";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Compliance Center...</div>}>
      <CompliancePage />
    </Suspense>
  );
}
