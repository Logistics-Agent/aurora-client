import { StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";

export function PermissionState({
  title = "Access restricted",
  description = "Your role can see that this capability exists, but it is not assigned.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <StatusBadge label="Permission required" intent="warning" />
      <p className="mt-3 font-semibold text-amber-900">{title}</p>
      <p className="mt-1 text-sm text-amber-800">{description}</p>
      <Button size="sm" variant="outline" className="mt-3">
        Request access
      </Button>
    </div>
  );
}
