import type {
  ReassignmentFormValues,
  ReassignmentValidationErrors,
} from "../types";

export function validateReassignment(
  values: ReassignmentFormValues,
): ReassignmentValidationErrors {
  const errors: ReassignmentValidationErrors = {};
  if (!values.targetUserId) {
    errors.targetUserId = "Choose a staff member to continue.";
  }
  if (!values.reason.trim()) {
    errors.reason = "Provide a business reason to continue.";
  }
  return errors;
}
