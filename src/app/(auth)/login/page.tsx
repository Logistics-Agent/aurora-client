import { Suspense } from "react";
import { LoginPage } from "@/features/auth";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
