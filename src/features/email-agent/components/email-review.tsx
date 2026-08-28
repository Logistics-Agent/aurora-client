"use client";

import { useState } from "react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { approveEmail, emailMocks } from "../mock";

export function EmailReview({ emailId }: { emailId?: string }) {
  const [emails, setEmails] = useState(emailMocks);
  const visibleEmails = emailId
    ? emails.filter((email) => email.id === emailId)
    : emails;

  return (
    <WorkspaceCard title={emailId ? "Email review" : "Carrier emails"}>
      <div className="space-y-3">
        {visibleEmails.map((email) => (
          <div className="rounded-lg border border-border p-4" key={email.id}>
            <p className="font-semibold">{email.subject}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {email.sender} · {email.extractedAction}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <StatusBadge
                label={email.state}
                intent={email.state === "Approved" ? "success" : "warning"}
              />
              <Button
                size="sm"
                disabled={email.state === "Approved"}
                onClick={() =>
                  setEmails((current) =>
                    current.map((item) =>
                      item.id === email.id ? approveEmail(item) : item,
                    ),
                  )
                }
              >
                Approve locally
              </Button>
            </div>
          </div>
        ))}
        {visibleEmails.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No local email fixture matches {emailId}.
          </p>
        )}
      </div>
    </WorkspaceCard>
  );
}
