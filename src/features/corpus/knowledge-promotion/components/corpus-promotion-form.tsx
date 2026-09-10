"use client";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useCorpusPromotionForm } from "../hooks/use-corpus-promotion-form";

export function CorpusPromotionForm() {
  const {
    id,
    setId,
    title,
    setTitle,
    storageReference,
    setStorageReference,
    promote,
    promoteGeneral,
  } = useCorpusPromotionForm();
  return (
    <WorkspaceCard title="Promote general document">
      <form className="space-y-2" onSubmit={promote}>
        <Input
          aria-label="General document id"
          value={id}
          onChange={(event) => setId(event.target.value)}
          placeholder="General document id"
        />
        <Input
          aria-label="Promotion title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Knowledge title"
        />
        <Input
          aria-label="Promotion storage reference"
          value={storageReference}
          onChange={(event) => setStorageReference(event.target.value)}
          placeholder="Storage reference"
        />
        {promoteGeneral.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(promoteGeneral.error)}
          </p>
        )}
        {promoteGeneral.data && (
          <p className="text-sm text-muted-foreground">
            Promotion {promoteGeneral.data.id}: {promoteGeneral.data.status}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            !id.trim() || !title.trim() || !storageReference.trim() || promoteGeneral.isPending
          }
        >
          {promoteGeneral.isPending ? "Promoting…" : "Promote to knowledge"}
        </Button>
      </form>
    </WorkspaceCard>
  );
}
