export interface ReassignmentFormValues {
  targetUserId: string;
  reason: string;
}

export interface ReassignmentValidationErrors {
  targetUserId?: string;
  reason?: string;
}

export interface MailAssigneeOption {
  userId: string;
  name: string;
}
