import { Badge } from "@/components/ui/badge";

const statusStyles = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-red-200 bg-red-50 text-red-700",
  ai: "border-violet-200 bg-violet-50 text-violet-700",
} as const;

export type StatusIntent = keyof typeof statusStyles;

export function StatusBadge({
  label,
  intent = "neutral",
}: {
  label: string;
  intent?: StatusIntent;
}) {
  return (
    <Badge variant="outline" className={statusStyles[intent]}>
      {label}
    </Badge>
  );
}
