import { StatusBadge } from "@/components/common";

export function NotificationAccessState() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <StatusBadge label="Permission required" intent="warning" />
      <p className="mt-3 font-semibold text-amber-900">
        Notification access required
      </p>
      <p className="mt-1 text-sm text-amber-800">
        Your account does not have notifications:access.
      </p>
    </div>
  );
}
