// UI-only fixture until backend integration phase.
export type NotificationMock = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notificationMocks: NotificationMock[] = [
  {
    id: "NTF-01",
    title: "Critical · Route deviation",
    body: "SHP-2026-00127 needs review",
    time: "2 min ago",
    read: false,
  },
  {
    id: "NTF-02",
    title: "OCR review",
    body: "Commercial invoice has 2 low-confidence fields",
    time: "18 min ago",
    read: false,
  },
  {
    id: "NTF-03",
    title: "Payment overdue",
    body: "INV-2026-0048 is overdue",
    time: "Today",
    read: true,
  },
];

export function markNotificationRead(
  notification: NotificationMock,
): NotificationMock {
  return { ...notification, read: true };
}
