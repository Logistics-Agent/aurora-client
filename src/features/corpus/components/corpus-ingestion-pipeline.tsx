import { cn } from "@/utils/cn";

const STEPS = [
  { key: "pending", label: "Pending", description: "Waiting for OCR worker" },
  { key: "ocr", label: "OCR", description: "Extracting document text" },
  { key: "chunking", label: "Chunking", description: "Splitting text into retrieval chunks" },
  { key: "embedding", label: "Embedding", description: "Generating vector embeddings" },
  { key: "ready", label: "Ready", description: "Available for grounded answers" },
] as const;

export type CorpusPipelineVersion = {
  status: string;
  chunkCount: number;
  embeddedChunkCount: number;
  errorMessage?: string | null;
};

type PipelineState = "complete" | "active" | "upcoming" | "failed";

function getActiveStep(version: CorpusPipelineVersion): number {
  if (version.status === "COMPLETED") return STEPS.length - 1;
  if (version.status === "PENDING" || version.status === "PENDING_OCR") return 0;
  if (version.status === "PROCESSING" || version.status === "FAILED") {
    return version.chunkCount > 0 ? 3 : 1;
  }
  return 0;
}

function getStepState(
  index: number,
  activeStep: number,
  isFailed: boolean,
  isCompleted: boolean,
): PipelineState {
  if (isFailed && index === activeStep) return "failed";
  if (isCompleted || index < activeStep) return "complete";
  if (!isFailed && index === activeStep) return "active";
  return "upcoming";
}

export function CorpusIngestionPipeline({ version }: { version: CorpusPipelineVersion }) {
  const isFailed = version.status === "FAILED";
  const isCompleted = version.status === "COMPLETED";
  const activeStep = getActiveStep(version);

  return (
    <div className="mt-3 space-y-2" aria-live="polite">
      <ol className="flex items-start" aria-label="Corpus ingestion pipeline">
        {STEPS.map((step, index) => {
          const state = getStepState(index, activeStep, isFailed, isCompleted);
          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                    state === "complete" && "border-primary bg-primary text-primary-foreground",
                    state === "active" && "border-primary bg-primary/10 text-primary",
                    state === "failed" && "border-destructive bg-destructive/10 text-destructive",
                    state === "upcoming" && "border-border bg-background text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {state === "complete" ? "✓" : state === "failed" ? "!" : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-tight",
                    state === "active" && "font-semibold text-primary",
                    state === "failed" && "font-semibold text-destructive",
                    state === "complete" && "text-foreground",
                    state === "upcoming" && "text-muted-foreground",
                  )}
                  data-state={state}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mt-3 h-px min-w-2 flex-1",
                    index < activeStep && !isFailed ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>
          {isFailed
            ? "Pipeline stopped"
            : isCompleted
              ? "Corpus is ready for grounded retrieval"
              : STEPS[activeStep]?.description}
        </span>
        <span className="shrink-0 font-medium">Status: {version.status}</span>
        {version.chunkCount > 0 && (
          <span className="shrink-0">
            {version.embeddedChunkCount}/{version.chunkCount} embedded
          </span>
        )}
      </div>
      {isFailed && version.errorMessage && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
        >
          {version.errorMessage}
        </p>
      )}
    </div>
  );
}
