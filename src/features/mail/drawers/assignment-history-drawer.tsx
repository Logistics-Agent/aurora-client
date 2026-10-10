"use client";

import type { RefObject } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AssignmentEvent } from "../types";

export interface AssignmentHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: readonly AssignmentEvent[];
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const eventLabels = {
  claim: "Claimed",
  reassign: "Reassigned",
  unassign: "Released to unassigned",
} as const;

export function AssignmentHistoryDrawer({
  open,
  onOpenChange,
  events,
  returnFocusRef,
}: AssignmentHistoryDrawerProps): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby="assignment-history-description"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle>Assignment history</SheetTitle>
          <SheetDescription id="assignment-history-description">
            Newest ownership changes appear first.
          </SheetDescription>
        </SheetHeader>
        <ol className="grid gap-4 overflow-auto px-4 pb-4">
          {[...events]
            .sort(
              (left, right) =>
                Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
            )
            .map((event) => (
            <li key={event.id} className="border-l border-border pl-3">
              <p className="font-medium">{eventLabels[event.type]}</p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={event.occurredAt}
                aria-label={`${eventLabels[event.type]} ${event.occurredAt}`}
              >
                {event.occurredAt}
              </time>
              <p className="text-sm text-muted-foreground">Actor: {event.actorId}</p>
              {event.targetUserId ? (
                <p className="text-sm text-muted-foreground">Assignee: {event.targetUserId}</p>
              ) : null}
              {event.reason ? (
                <p className="text-sm text-muted-foreground">Reason: {event.reason}</p>
              ) : null}
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-sm text-muted-foreground">No assignment changes yet.</li>
          ) : null}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
