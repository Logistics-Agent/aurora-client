"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ALL_FILTER_VALUE = "__all__";

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
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search threads"
          placeholder="Search subject, sender, or preview…"
          className="h-8 bg-secondary/40 pl-8 text-xs"
          value={filters.search ?? ""}
          onChange={(event) =>
            onFiltersChange({ ...filters, search: event.target.value || undefined })
          }
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Mailbox</span>
          <Select
            value={filters.mailboxId ?? ALL_FILTER_VALUE}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                mailboxId: value === ALL_FILTER_VALUE ? undefined : value,
              })
            }
          >
            <SelectTrigger
              id="mailbox-filter"
              aria-label="Mailbox"
              size="sm"
              className="h-8 w-full min-w-0 bg-background text-xs"
            >
              <SelectValue placeholder="All mailboxes" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="duration-150 ease-out">
              <SelectItem value={ALL_FILTER_VALUE}>All mailboxes</SelectItem>
              {mailboxes.map((mailbox) => (
                <SelectItem key={mailbox.id} value={mailbox.id}>
                  {mailbox.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Status</span>
          <Select
            value={filters.status ?? ALL_FILTER_VALUE}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === ALL_FILTER_VALUE ? undefined : (value as MailThreadStatus),
              })
            }
          >
            <SelectTrigger
              id="status-filter"
              aria-label="Status"
              size="sm"
              className="h-8 w-full min-w-0 bg-background text-xs"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="duration-150 ease-out">
              <SelectItem value={ALL_FILTER_VALUE}>All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">Priority</span>
          <Select
            value={filters.priority ?? ALL_FILTER_VALUE}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                priority: value === ALL_FILTER_VALUE ? undefined : (value as MailPriority),
              })
            }
          >
            <SelectTrigger
              id="priority-filter"
              aria-label="Priority"
              size="sm"
              className="h-8 w-full min-w-0 bg-background text-xs"
            >
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="duration-150 ease-out">
              <SelectItem value={ALL_FILTER_VALUE}>All priorities</SelectItem>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
    </fieldset>
  );
}
