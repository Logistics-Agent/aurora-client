import { PageHeader } from "@/components/layout";

import { KnowledgePromotionWorkflow } from "./knowledge-promotion";
import { RegulatoryIngestionWorkflow } from "./regulatory-ingestion";
import { RegulatorySearchWorkflow } from "./regulatory-search";

export function CorpusPage() {
  return (
    <>
      <PageHeader
        title="Regulatory corpus"
        description="Search tenant and platform regulatory evidence with traceable citations."
      />
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <RegulatoryIngestionWorkflow />
          <KnowledgePromotionWorkflow />
        </div>
        <RegulatorySearchWorkflow />
      </div>
    </>
  );
}
