import { AppShell } from "@/components/layout";
import { NotificationPopup } from "@/features/notifications/popup";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <NotificationPopup />
      {children}
    </AppShell>
  );
}
