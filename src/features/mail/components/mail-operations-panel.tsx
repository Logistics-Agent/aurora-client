"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useMailMutations } from "@/hooks/mutations/mail/use-mail-mutations";
import { useProcessedMessageQuery } from "@/hooks/queries/mail/use-processed-message-query";
import { useProcessedMessagesQuery } from "@/hooks/queries/mail/use-processed-messages-query";
import { useQuarantineQuery } from "@/hooks/queries/mail/use-quarantine-query";
import { useQuarantineRecordQuery } from "@/hooks/queries/mail/use-quarantine-record-query";

type OperationsTab = "history" | "quarantine";

export function MailOperationsPanel({
  enabled,
  canRelease,
  canViewQuarantine,
}: {
  enabled: boolean;
  canRelease: boolean;
  canViewQuarantine: boolean;
}): React.JSX.Element {
  const [tab, setTab] = useState<OperationsTab>("history");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedQuarantineId, setSelectedQuarantineId] = useState<string | null>(null);
  const [releaseCandidate, setReleaseCandidate] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState(false);
  const historyQuery = useProcessedMessagesQuery(
    { pageSize: 20 },
    { enabled: enabled && tab === "history" },
  );
  const quarantineQuery = useQuarantineQuery(
    { pageSize: 20 },
    { enabled: enabled && canViewQuarantine && tab === "quarantine" },
  );
  const messageQuery = useProcessedMessageQuery(selectedMessageId, {
    enabled: enabled && tab === "history",
  });
  const quarantineRecordQuery = useQuarantineRecordQuery(selectedQuarantineId, {
    enabled: enabled && canViewQuarantine && tab === "quarantine",
  });
  const { releaseQuarantine } = useMailMutations();

  return (
    <section
      aria-label="Mail operations"
      className="grid gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold">Mail operations</h2>
          <p className="text-sm text-muted-foreground">
            Review processed messages and quarantine records available to this tenant.
          </p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Mail operations views">
          <Button
            type="button"
            variant={tab === "history" ? "default" : "outline"}
            role="tab"
            aria-selected={tab === "history"}
            onClick={() => {
              setTab("history");
              setSelectedQuarantineId(null);
            }}
          >
            Message history
          </Button>
          {canViewQuarantine ? (
            <Button
              type="button"
              variant={tab === "quarantine" ? "default" : "outline"}
              role="tab"
              aria-selected={tab === "quarantine"}
              onClick={() => {
                setTab("quarantine");
                setSelectedMessageId(null);
                setReleaseError(false);
              }}
            >
              Quarantine
            </Button>
          ) : null}
        </div>
      </div>
      {tab === "history" ? (
        <ProcessedMessages
          query={historyQuery}
          selectedId={selectedMessageId}
          onSelect={setSelectedMessageId}
          detailQuery={messageQuery}
        />
      ) : (
        <QuarantineRecords
          query={quarantineQuery}
          canRelease={canRelease}
          isReleasing={releaseQuarantine.isPending}
          release={releaseQuarantine.mutateAsync}
          selectedId={selectedQuarantineId}
          onSelect={setSelectedQuarantineId}
          detailQuery={quarantineRecordQuery}
          releaseCandidate={releaseCandidate}
          releaseError={releaseError}
          onReleaseCandidate={(id) => {
            setReleaseCandidate(id);
            setReleaseError(false);
          }}
          onReleaseError={() => setReleaseError(true)}
        />
      )}
    </section>
  );
}

function ProcessedMessages({
  query,
  selectedId,
  onSelect,
  detailQuery,
}: {
  query: ReturnType<typeof useProcessedMessagesQuery>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  detailQuery: ReturnType<typeof useProcessedMessageQuery>;
}): React.JSX.Element {
  if (query.isLoading)
    return <p className="text-sm text-muted-foreground">Loading message history…</p>;
  if (query.error)
    return (
      <p role="alert" className="text-sm text-destructive">
        Message history could not be loaded.
      </p>
    );
  if (!query.data?.messages.length)
    return <p className="text-sm text-muted-foreground">No processed messages found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="p-2">Subject</th>
            <th className="p-2">Category</th>
            <th className="p-2">Pipeline</th>
            <th className="p-2">Received</th>
            <th className="p-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {query.data.messages.map((message) => (
            <tr key={message.processedMessageId} className="border-b border-border last:border-0">
              <td className="p-2 font-medium">{message.subject || "(no subject)"}</td>
              <td className="p-2">{message.emailCategory ?? "—"}</td>
              <td className="p-2">{message.pipelineStatus}</td>
              <td className="p-2">{formatDate(message.receivedAt)}</td>
              <td className="p-2 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onSelect(
                      selectedId === message.processedMessageId ? null : message.processedMessageId,
                    )
                  }
                >
                  {selectedId === message.processedMessageId ? "Hide" : "View"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedId ? <ProcessedMessageDetail query={detailQuery} /> : null}
    </div>
  );
}

function ProcessedMessageDetail({
  query,
}: {
  query: ReturnType<typeof useProcessedMessageQuery>;
}): React.JSX.Element {
  if (query.isLoading)
    return <p className="mt-3 text-sm text-muted-foreground">Loading message detail…</p>;
  if (query.error || !query.data)
    return (
      <p role="alert" className="mt-3 text-sm text-destructive">
        Message detail could not be loaded.
      </p>
    );
  return (
    <div className="mt-3 grid gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
      <p>
        <strong>Sender:</strong> {query.data.senderAddress}
      </p>
      <p>
        <strong>Recipients:</strong> {query.data.recipientAddresses.join(", ")}
      </p>
      <p>
        <strong>Raw EML:</strong> {query.data.r2RawEmlPath ?? "Not available"}
      </p>
      <p>
        <strong>Spam:</strong> {formatScore(query.data.spamScore)} · <strong>Phishing:</strong>{" "}
        {formatScore(query.data.phishingScore)}
      </p>
      <div>
        <strong>Security checks</strong>
        <ul className="list-disc pl-5">
          {query.data.securityChecks.map((check) => (
            <li key={`${check.stage}-${check.durationMs}`}>
              {check.stage}: {check.result} ({check.durationMs} ms)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuarantineRecords({
  query,
  canRelease,
  isReleasing,
  release,
  selectedId,
  onSelect,
  detailQuery,
  releaseCandidate,
  onReleaseCandidate,
  releaseError,
  onReleaseError,
}: {
  query: ReturnType<typeof useQuarantineQuery>;
  canRelease: boolean;
  isReleasing: boolean;
  release: (id: string) => Promise<unknown>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  detailQuery: ReturnType<typeof useQuarantineRecordQuery>;
  releaseCandidate: string | null;
  onReleaseCandidate: (id: string | null) => void;
  releaseError: boolean;
  onReleaseError: () => void;
}): React.JSX.Element {
  if (query.isLoading)
    return <p className="text-sm text-muted-foreground">Loading quarantine records…</p>;
  if (query.error)
    return (
      <p role="alert" className="text-sm text-destructive">
        Quarantine records could not be loaded.
      </p>
    );
  if (!query.data?.records.length)
    return <p className="text-sm text-muted-foreground">No quarantine records found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="p-2">Reason</th>
            <th className="p-2">Status</th>
            <th className="p-2">Quarantined</th>
            <th className="p-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {query.data.records.map((record) => (
            <tr key={record.quarantineId} className="border-b border-border last:border-0">
              <td className="p-2">{record.quarantineReason}</td>
              <td className="p-2">{record.status}</td>
              <td className="p-2">{formatDate(record.quarantinedAt)}</td>
              <td className="p-2 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onSelect(selectedId === record.quarantineId ? null : record.quarantineId)
                  }
                >
                  {selectedId === record.quarantineId ? "Hide" : "View"}
                </Button>
                {canRelease && record.status.toLowerCase() === "pending" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isReleasing}
                    onClick={() => onReleaseCandidate(record.quarantineId)}
                  >
                    Release
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedId ? (
        <div className="mt-3 grid gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
          {detailQuery.isLoading ? (
            <p>Loading quarantine detail…</p>
          ) : detailQuery.error || !detailQuery.data ? (
            <p role="alert" className="text-destructive">
              Quarantine detail could not be loaded.
            </p>
          ) : (
            <>
              <p>
                <strong>Message ID:</strong> {detailQuery.data.messageId}
              </p>
              <p>
                <strong>Reason:</strong> {detailQuery.data.quarantineReason}
              </p>
              <p>
                <strong>Review status:</strong> {detailQuery.data.status}
              </p>
            </>
          )}
        </div>
      ) : null}
      {releaseCandidate ? (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          <span>
            {releaseError
              ? "The message could not be released. Refresh and try again."
              : "Release this quarantined message? This changes its security state."}
          </span>
          <span className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onReleaseCandidate(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isReleasing}
              onClick={() =>
                void release(releaseCandidate)
                  .then(() => onReleaseCandidate(null))
                  .catch(onReleaseError)
              }
            >
              {isReleasing ? "Releasing…" : "Confirm release"}
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatScore(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}
