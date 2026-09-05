export interface MailboxIdentityProps {
  address: string;
  label?: string;
  isDefault?: boolean;
  status?: "active" | "suspended";
}
