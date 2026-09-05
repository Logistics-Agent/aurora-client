"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { MailListFilters, MailMailbox, MailPriority, MailThreadStatus } from "../../types";

export interface ThreadFiltersProps {
  filters: MailListFilters;
  mailboxes: readonly MailMailbox[];
  onFiltersChange: (filters: MailListFilters) => void;
}

const statuses: readonly { value: MailThreadStatus; label: string }[] = [
  { value: "unassigned", label: "Unassigned" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_customer", label: "Waiting for customer" },
  { value: "resolved", label: "Resolved" },
];
const priorities: readonly { value: MailPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function ThreadFilters({
  filters,
  mailboxes,
  onFiltersChange,
}: ThreadFiltersProps): React.JSX.Element {
  return (
    <fieldset className="space-y-2 border-b border-border p-3">
      <legend className="sr-only">Filter mail threads</legend>
      <label className="relative block text-xs font-medium text-muted-foreground">
        <span className="sr-only">Search threads</span>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search threads"
          placeholder="Search subject, sender, or preview…"
          className="h-8 pl-8 text-xs bg-secondary/40"
          value={filters.search ?? ""}
          onChange={(event) =>
            onFiltersChange({ ...filters, search: event.target.value || undefined })
          }
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Mailbox</span>
          <select
            aria-label="Mailbox"
            className="h-8 w-full min-w-0 truncate rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filters.mailboxId ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                mailboxId: event.target.value || undefined,
              })
            }
          >
            <option value="">All mailboxes</option>
            {mailboxes.map((mailbox) => (
              <option key={mailbox.id} value={mailbox.id}>
                {mailbox.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Status</span>
          <select
            aria-label="Status"
            className="h-8 w-full min-w-0 truncate rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filters.status ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: (event.target.value || undefined) as MailThreadStatus | undefined,
              })
            }
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Priority</span>
          <select
            aria-label="Priority"
            className="h-8 w-full min-w-0 truncate rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filters.priority ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                priority: (event.target.value || undefined) as MailPriority | undefined,
              })
            }
          >
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
