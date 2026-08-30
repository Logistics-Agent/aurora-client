export function NotificationEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="font-semibold">No notifications yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Shipment and document updates will appear here.
      </p>
    </div>
  );
}
