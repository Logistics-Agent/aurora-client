import { CustomerShell } from "@/components/layout";
import { NotificationPopup } from "@/features/notifications/popup";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerShell>
      <NotificationPopup />
      {children}
    </CustomerShell>
  );
}
