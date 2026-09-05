import { StatusBadge } from "../status-badge";
import type { MailboxIdentityProps } from "./types";

const statusPresentation = {
  active: { label: "Active", intent: "success" },
  suspended: { label: "Suspended", intent: "warning" },
} as const;

export function MailboxIdentity({
  address,
  label,
  isDefault,
  status,
}: MailboxIdentityProps) {
  const displayLabel = label || address;
  const statusDetails = status ? statusPresentation[status] : undefined;

  return (
    <div
      role="group"
      aria-label={`${displayLabel} mailbox`}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="font-medium text-slate-950">{address}</span>
      {label ? <span className="text-sm text-slate-600">{label}</span> : null}
      {isDefault ? (
        <span className="text-xs font-semibold tracking-wide text-slate-600">
          DEFAULT
        </span>
      ) : null}
      {statusDetails ? <StatusBadge {...statusDetails} /> : null}
    </div>
  );
}
