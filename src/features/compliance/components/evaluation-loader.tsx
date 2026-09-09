import type { FormEvent } from "react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EvaluationLoader({
  value,
  loading,
  onChange,
  onSubmit,
}: {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <WorkspaceCard title="Load compliance evaluation">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <Input
          aria-label="Compliance evaluation id"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter persisted evaluation id"
        />
        <Button type="submit" disabled={!value.trim() || loading}>
          {loading ? "Loading…" : "Load"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
