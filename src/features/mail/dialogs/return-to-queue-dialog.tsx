"use client";

import { useState, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ReturnToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void> | void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function ReturnToQueueDialog({
  open,
  onOpenChange,
  onSubmit,
  returnFocusRef,
}: ReturnToQueueDialogProps): React.JSX.Element {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setError("Provide a business reason to continue.");
      return;
    }
    try {
      setError(null);
      await onSubmit(normalizedReason);
      onOpenChange(false);
    } catch {
      setError("Could not release this thread. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Release to unassigned</DialogTitle>
          <DialogDescription>
            This returns the thread to the shared work queue.
          </DialogDescription>
        </DialogHeader>
        <label className="grid gap-1" htmlFor="mail-release-reason">
          <span>Release reason</span>
          <textarea
            id="mail-release-reason"
            aria-label="Release reason"
            value={reason}
            aria-invalid={Boolean(error)}
            onChange={(event) => setReason(event.target.value)}
          />
          {error ? <span role="alert">{error}</span> : null}
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void submit()}>
            Release thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
