import type { MailDraftFormValues, MailDraftValidationResult } from "../types";

export function validateMailDraft(
  values: MailDraftFormValues,
  allowedMailboxIds: readonly string[],
): MailDraftValidationResult {
  if (!values.body.trim()) {
    return { valid: false, error: "Write a reply before continuing." };
  }
  if (!allowedMailboxIds.includes(values.senderMailboxId)) {
    return { valid: false, error: "Choose an accessible shared mailbox." };
  }
  return { valid: true };
}
