import type { ReactNode } from "react";

export function WorkspaceCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card p-4 shadow-[0_2px_8px_rgba(16,32,51,0.04)] sm:p-5 ${className}`}
    >
      {title && <h2 className="mb-4 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
      {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
}
