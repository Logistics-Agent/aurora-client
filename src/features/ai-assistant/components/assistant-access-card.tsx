import { LockKeyhole } from "lucide-react";

import { WorkspaceCard } from "@/components/common";

export function AssistantAccessCard() {
  return (
    <WorkspaceCard title="Assistant access">
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-emerald-700">Can access</p>
          <p className="mt-1 text-muted-foreground">
            Permitted operational and regulatory evidence returned by the server.
          </p>
        </div>
        <div>
          <p className="flex items-center gap-2 font-medium text-slate-700">
            <LockKeyhole className="size-4" /> Restricted
          </p>
          <p className="mt-1 text-muted-foreground">
            The assistant cannot change shipment, compliance or commercial data.
          </p>
        </div>
        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          Review sources and governance status before acting.
        </p>
      </div>
    </WorkspaceCard>
  );
}
