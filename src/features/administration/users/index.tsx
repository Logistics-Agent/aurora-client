"use client";

import { useState } from "react";
import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { toggleUserState, userMocks } from "../mock";

export function UsersPage() {
  const [users, setUsers] = useState(userMocks);

  return (
    <>
      <PageHeader
        title="Users"
        description="Administration records and role-aware actions."
      />
      <WorkspaceCard title="User access">
        <div className="space-y-3">
          {users.map((user) => (
            <div
              className="flex items-center justify-between rounded-lg border border-border p-3"
              key={user.id}
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setUsers((current) =>
                    current.map((item) =>
                      item.id === user.id ? toggleUserState(item) : item,
                    ),
                  )
                }
              >
                {user.state}
              </Button>
            </div>
          ))}
        </div>
      </WorkspaceCard>
    </>
  );
}
