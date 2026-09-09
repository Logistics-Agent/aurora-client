import { PageHeader } from "@/components/layout";

import { CorpusIngestionForm } from "./components/corpus-ingestion-form";
import { CorpusPromotionForm } from "./components/corpus-promotion-form";
import { CorpusSearch } from "./components/corpus-search";

export function CorpusPage() {
  return (
    <>
      <PageHeader
        title="Regulatory corpus"
        description="Search tenant and platform regulatory evidence with traceable citations."
      />
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <CorpusIngestionForm />
          <CorpusPromotionForm />
        </div>
        <CorpusSearch />
      </div>
    </>
  );
}
