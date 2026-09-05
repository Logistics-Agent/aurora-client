export interface MailDraftFormValues {
  senderMailboxId: string;
  body: string;
  attachmentIds: readonly string[];
}

export type MailDraftValidationResult =
  | { valid: true }
  | { valid: false; error: string };
