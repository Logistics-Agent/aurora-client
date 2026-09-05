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
import type { MailAssigneeOption, ReassignmentFormValues } from "./types";
import { validateReassignment } from "./utils/validate-reassignment";

export interface ReassignThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignees: readonly MailAssigneeOption[];
  onSubmit: (targetUserId: string, reason: string) => Promise<void> | void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function ReassignThreadDialog({
  open,
  onOpenChange,
  assignees,
  onSubmit,
  returnFocusRef,
}: ReassignThreadDialogProps): React.JSX.Element {
  const [values, setValues] = useState<ReassignmentFormValues>({
    targetUserId: "",
    reason: "",
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateReassignment>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    const nextErrors = validateReassignment(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitError(null);
      await onSubmit(values.targetUserId, values.reason.trim());
      onOpenChange(false);
    } catch {
      setSubmitError("Could not reassign this thread. Try again.");
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
          <DialogTitle>Reassign thread</DialogTitle>
          <DialogDescription>
            Assign one accountable staff member and record the operational reason.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1" htmlFor="mail-reassign-target">
            <span>Assign to</span>
            <select
              id="mail-reassign-target"
              aria-label="Assign to"
              value={values.targetUserId}
              aria-invalid={Boolean(errors.targetUserId)}
              onChange={(event) =>
                setValues((current) => ({ ...current, targetUserId: event.target.value }))
              }
            >
              <option value="">Choose staff</option>
              {assignees.map((assignee) => (
                <option key={assignee.userId} value={assignee.userId}>
                  {assignee.name}
                </option>
              ))}
            </select>
            {errors.targetUserId ? <span role="alert">{errors.targetUserId}</span> : null}
          </label>
          <label className="grid gap-1" htmlFor="mail-reassign-reason">
            <span>Business reason</span>
            <textarea
              id="mail-reassign-reason"
              aria-label="Business reason"
              value={values.reason}
              aria-invalid={Boolean(errors.reason)}
              onChange={(event) =>
                setValues((current) => ({ ...current, reason: event.target.value }))
              }
            />
            {errors.reason ? <span role="alert">{errors.reason}</span> : null}
          </label>
          {submitError ? <p role="alert">{submitError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()}>Confirm reassignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
