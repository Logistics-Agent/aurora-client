"use client";

import { useState } from "react";
import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TenantSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader
        title="Tenant Settings"
        description="Govern operational workspace preferences locally."
        actions={
          <Button onClick={() => setSaved(true)}>
            {saved ? "Saved locally" : "Save locally"}
          </Button>
        }
      />
      <WorkspaceCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Tenant name
            <Input defaultValue="ACME Logistics" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Timezone
            <Input defaultValue="Asia/Ho_Chi_Minh" />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            Exception policy
            <Textarea defaultValue="Critical events stay persistent until reviewed." />
          </label>
        </div>
      </WorkspaceCard>
    </>
  );
}
