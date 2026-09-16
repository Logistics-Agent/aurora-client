"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useMailMutations } from "@/hooks/mutations/mail/use-mail-mutations";
import { useQuarantineQuery } from "@/hooks/queries/mail/use-quarantine-query";
import { useQuarantineRecordQuery } from "@/hooks/queries/mail/use-quarantine-record-query";

export function MailQuarantinePanel({
  enabled,
  canRelease,
}: {
  enabled: boolean;
  canRelease: boolean;
}): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [releaseCandidate, setReleaseCandidate] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState(false);
  const query = useQuarantineQuery({ pageSize: 20 }, { enabled });
  const detailQuery = useQuarantineRecordQuery(selectedId, { enabled });
  const { releaseQuarantine } = useMailMutations();

  if (query.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading quarantine records…</p>;
  }

  if (query.error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Quarantine records could not be loaded.
      </p>
    );
  }

  if (!query.data?.records.length) {
    return <p className="text-sm text-muted-foreground">No quarantine records found.</p>;
  }

  return (
    <div className="grid gap-3">
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
                      setSelectedId((current) =>
                        current === record.quarantineId ? null : record.quarantineId,
                      )
                    }
                  >
                    {selectedId === record.quarantineId ? "Hide" : "View"}
                  </Button>
                  {canRelease && record.status.toLowerCase() === "pending" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={releaseQuarantine.isPending}
                      onClick={() => {
                        setReleaseCandidate(record.quarantineId);
                        setReleaseError(false);
                      }}
                    >
                      Release
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId ? (
        <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
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
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          <span>
            {releaseError
              ? "The message could not be released. Refresh and try again."
              : "Release this quarantined message? This changes its security state."}
          </span>
          <span className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setReleaseCandidate(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={releaseQuarantine.isPending}
              onClick={() =>
                void releaseQuarantine
                  .mutateAsync(releaseCandidate)
                  .then(() => setReleaseCandidate(null))
                  .catch(() => setReleaseError(true))
              }
            >
              {releaseQuarantine.isPending ? "Releasing…" : "Confirm release"}
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
