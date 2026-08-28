import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

export function LoadingState({
  label = "Loading workspace",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-6 text-center">
      <Inbox className="size-6 text-slate-400" />
      <p className="font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Workspace unavailable",
  description = "Try again or continue with the available context.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-32 items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      <AlertCircle className="size-5 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-red-700/80">{description}</p>
      </div>
    </div>
  );
}
