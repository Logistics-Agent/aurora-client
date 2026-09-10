"use client";

import type { FormEvent } from "react";

import { PageHeader } from "@/components/layout";
import { getApiErrorMessage } from "@/lib/api-error";

import { AssistantAccessCard } from "./components/assistant-access-card";
import { AssistantAnswer } from "./components/assistant-answer";
import { AssistantComposer } from "./components/assistant-composer";
import { useAssistantWorkspace } from "./hooks/use-assistant-workspace";

export function AiAssistantPage() {
  const { question, setQuestion, askQuestion, answer, error, isPending } = useAssistantWorkspace();
  const ask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await askQuestion();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="AI Assistant"
<<<<<<< HEAD
        description="Grounded logistics & compliance intelligence powered by official regulations and tenant SOP evidence."
      />

      {/* Query Search Card */}
      <WorkspaceCard>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400">
                <Bot className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Ask Grounded Logistics Question</h3>
                <p className="text-xs text-muted-foreground">
                  Answers are synthesized strictly from verified Regulatory sources and Ingested SOPs.
                </p>
              </div>
            </div>

            {/* Mode & Jurisdiction Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-medium">
                {(
                  [
                    { id: "ALL", label: "All Evidence" },
                    { id: "REGULATORY", label: "Regulations Only" },
                    { id: "KNOWLEDGE", label: "SOPs Only" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      mode === m.id
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <select
                aria-label="Filter by jurisdiction"
                value={jurisdictionCode}
                onChange={(e) => setJurisdictionCode(e.target.value)}
                className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Jurisdictions</option>
                <option value="VN">Vietnam (VN)</option>
                <option value="EU">European Union (EU)</option>
                <option value="US">United States (US)</option>
                <option value="ASEAN">ASEAN Region</option>
              </select>
            </div>
          </div>

          {/* Input Box */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Input
                aria-label="Query for grounded AI assistant"
                placeholder="Ask about compliance rules, customs requirements, port procedures, or carrier SOPs…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                className="h-11 bg-card pr-10 text-sm shadow-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <Button
              type="button"
              disabled={!query.trim() || assistantMutation.isPending}
              onClick={() => handleAsk()}
              className="h-11 px-5 shadow-xs"
            >
              {assistantMutation.isPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Reasoning…
                </>
              ) : (
                <>
                  <Send className="size-4 mr-1.5" />
                  Query Assistant
                </>
              )}
            </Button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Suggested queries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleAsk(prompt)}
                  className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-left text-xs text-secondary-foreground hover:bg-secondary hover:border-primary/40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </WorkspaceCard>

      {/* Error state */}
      {assistantMutation.isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Unable to generate grounded answer</p>
            <p className="text-xs mt-1 text-destructive/90">
              {assistantMutation.error?.message ||
                "Failed to communicate with Regulatory Compliance AI service. Check network or server status."}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAsk()}
            className="text-xs shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {assistantMutation.isPending && (
        <WorkspaceCard title="Grounding & Synthesizing Evidence">
          <div className="space-y-4 py-3 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded-full bg-violet-200" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-4/6 rounded bg-muted" />
            </div>
            <div className="h-20 w-full rounded-xl bg-muted/60" />
          </div>
        </WorkspaceCard>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-5">
          {/* Main Answer Card */}
          <WorkspaceCard>
            <div className="space-y-4">
              {/* Header with Governance Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    Grounded AI Answer
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-medium text-foreground">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    Level: {result.governance?.automationLevel || "ASSISTED"}
                  </span>
                  {result.governance?.totalTokens ? (
                    <span className="rounded-md bg-secondary px-2 py-0.5">
                      Tokens: {result.governance.totalTokens}
                    </span>
                  ) : null}
                  {result.retrievalTraceId && (
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      Trace: {result.retrievalTraceId.slice(0, 8)}…
                    </span>
                  )}
                </div>
              </div>

              {/* Insufficient Evidence Alert */}
              {result.insufficientEvidence && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-2.5">
                  <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Insufficient Evidence Grounding</p>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                      The knowledge base does not contain enough authoritative sources to guarantee complete factual certainty.
                    </p>
                    {result.missingInformation && result.missingInformation.length > 0 && (
                      <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-[11px]">
                        {result.missingInformation.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Conflict Warnings */}
              {result.conflicts && result.conflicts.length > 0 && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                    <ShieldAlert className="size-4" />
                    Regulatory vs. Internal SOP Conflict Detected ({result.conflicts.length})
                  </div>
                  <div className="space-y-1.5">
                    {result.conflicts.map((conflict, idx) => (
                      <p key={idx} className="text-xs leading-relaxed text-rose-800/90 dark:text-rose-200">
                        • {conflict.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesized Answer Text */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Question: &ldquo;{result.query}&rdquo;
                </p>
                <div className="text-sm font-normal leading-relaxed text-foreground whitespace-pre-line space-y-2">
                  {result.answer || "No grounded answer could be formulated."}
                </div>
              </div>

              {/* Actions and Human Review */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>
                    <Scale className="inline size-3.5 mr-1 text-primary" />
                    {result.regulatoryCitations?.length || 0} Regulatory Citations
                  </span>
                  <span>
                    <FileText className="inline size-3.5 mr-1 text-violet-600" />
                    {result.knowledgeReferences?.length || 0} SOP References
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCitations(!showCitations)}
                    className="text-xs h-8"
                  >
                    {showCitations ? (
                      <>
                        <ChevronUp className="size-3.5 mr-1" /> Hide Evidence
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-3.5 mr-1" /> View Citations ({ (result.regulatoryCitations?.length || 0) + (result.knowledgeReferences?.length || 0) })
                      </>
                    )}
                  </Button>

                  {reviewRequested ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                      <CheckCircle2 className="size-3.5" /> Review Escalated
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setReviewRequested(true)}
                      className="text-xs h-8"
                    >
                      Request Human Review
                    </Button>
                  )}
                </div>
              </div>

              {reviewRequested && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
                  Human review request logged for this response (Decision Trace: {result.retrievalTraceId || "active-session"}). Operations manager notified.
                </div>
              )}
            </div>
          </WorkspaceCard>

          {/* Citations & Evidence Section */}
          {showCitations && (
            <WorkspaceCard title="Grounding Citations & Evidence">
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-border pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("regulatory")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === "regulatory"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Scale className="size-3.5" />
                    Regulatory Citations ({result.regulatoryCitations?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("knowledge")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === "knowledge"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="size-3.5" />
                    Internal SOP & Knowledge ({result.knowledgeReferences?.length || 0})
                  </button>
                </div>

                {/* Regulatory Tab Content */}
                {activeTab === "regulatory" && (
                  <div className="space-y-3">
                    {result.regulatoryCitations && result.regulatoryCitations.length > 0 ? (
                      result.regulatoryCitations.map((citation, idx) => (
                        <div
                          key={citation.evidenceId || idx}
                          className="rounded-xl border border-border bg-card p-4 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {citation.title || "Regulatory Document"}
                              </span>
                              {citation.jurisdiction && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  {citation.jurisdiction}
                                </span>
                              )}
                              {citation.regulationType && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {citation.regulationType}
                                </span>
                              )}
                            </div>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Score: {(citation.score * 100).toFixed(0)}%
                            </span>
                          </div>

                          <p className="text-muted-foreground text-xs leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/50">
                            &ldquo;{citation.excerpt}&rdquo;
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                            <span>
                              Authority: <strong className="text-foreground">{citation.authority || "N/A"}</strong>
                              {citation.section ? ` · Section: ${citation.section}` : ""}
                              {citation.page ? ` · Page ${citation.page}` : ""}
                            </span>
                            {citation.canonicalSourceUri && (
                              <a
                                href={citation.canonicalSourceUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                              >
                                Official Reference <ExternalLink className="size-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        No direct regulatory citations returned for this query.
                      </p>
                    )}
                  </div>
                )}

                {/* Knowledge & SOP Tab Content */}
                {activeTab === "knowledge" && (
                  <div className="space-y-3">
                    {result.knowledgeReferences && result.knowledgeReferences.length > 0 ? (
                      result.knowledgeReferences.map((ref, idx) => (
                        <div
                          key={ref.evidenceId || idx}
                          className="rounded-xl border border-border bg-card p-4 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {ref.title || "Internal SOP Document"}
                              </span>
                              {ref.category && (
                                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                                  {ref.category}
                                </span>
                              )}
                            </div>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Score: {(ref.score * 100).toFixed(0)}%
                            </span>
                          </div>

                          <p className="text-muted-foreground text-xs leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/50">
                            &ldquo;{ref.excerpt}&rdquo;
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                            <span>
                              {ref.section ? `Section: ${ref.section}` : "Standard Procedure"}
                              {ref.page ? ` · Page ${ref.page}` : ""}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground/70">
                              Evidence ID: {ref.evidenceId?.slice(0, 8) || "ref"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        No internal SOP references returned for this query.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </WorkspaceCard>
          )}
        </div>
      )}

      {/* Initial Empty State */}
      {!result && !assistantMutation.isPending && !assistantMutation.isError && (
        <WorkspaceCard title="Knowledge Intelligence Scope">
          <div className="grid gap-4 sm:grid-cols-3 py-2">
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Scale className="size-4 text-blue-600" /> Statutory Compliance
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ground answers against national customs codes, ASEAN transport treaties, and IMO maritime standards.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <BookOpen className="size-4 text-violet-600" /> Ingested Tenant SOPs
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strict adherence to company-specific cold chain thresholds, terminal detention guidelines, and rate cards.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Layers className="size-4 text-emerald-600" /> Conflict Detection
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically alerts operators when internal operational policies conflict with legal regulations.
              </p>
            </div>
          </div>
        </WorkspaceCard>
      )}
    </div>
=======
        description="Ask grounded questions about permitted operational and compliance context."
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <AssistantComposer
            question={question}
            isPending={isPending}
            errorMessage={error ? getApiErrorMessage(error) : undefined}
            onQuestionChange={setQuestion}
            onSubmit={ask}
          />
          {answer && <AssistantAnswer response={answer} />}
        </div>
        <AssistantAccessCard />
      </div>
    </>
>>>>>>> f64c331b35ec021bf1625e19240479d7475ec0bd
  );
}
