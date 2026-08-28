"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function ImportShipmentsPage() {
  const [validated, setValidated] = useState(false);

  return (
    <>
      <PageHeader
        title="Import Shipments"
        description="Map a local file and keep validation failures visible."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <WorkspaceCard title="Select file">
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Upload className="mx-auto size-8 text-primary" />
            <p className="mt-3 font-semibold">CSV or XLSX mock</p>
            <Button className="mt-4" onClick={() => setValidated(true)}>
              {validated ? "File selected" : "Select file"}
            </Button>
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Validation">
          <StatusBadge
            label={validated ? "Mapped" : "Waiting for file"}
            intent={validated ? "success" : "warning"}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            {validated
              ? "2 rows need correction before local import review."
              : "Select a mock file to start mapping."}
          </p>
        </WorkspaceCard>
      </div>
    </>
  );
}
