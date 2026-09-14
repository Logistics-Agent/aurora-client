import { AlertTriangle } from "lucide-react";

export function AssistantProviderUnavailable() {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="size-4" /> Assistant provider is unavailable
      </p>
      <p className="mt-1">
        No answer was generated. Please try again when the verified assistant service is available.
      </p>
    </div>
  );
}
