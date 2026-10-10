import type { FormEvent } from "react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ComplianceCopilotForm({
  query,
  pending,
  errorMessage,
  onChange,
  onSubmit,
}: {
  query: string;
  pending: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <WorkspaceCard title="Ask about this evaluation">
      <form className="space-y-2" onSubmit={onSubmit}>
        <Input
          aria-label="Compliance copilot question"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask a grounded compliance question"
        />
        <Button type="submit" disabled={!query.trim() || pending}>
          {pending ? "Checking evidence…" : "Ask copilot"}
        </Button>
      </form>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </WorkspaceCard>
  );
}
