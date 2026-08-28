"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FilterBar({
  placeholder = "Search shipments",
  value,
  onChange,
  chips = [],
  onClear,
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  chips?: string[];
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {chip}
          </span>
        ))}
        {onClear && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
