"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";

export function useQuarantineRecordQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: id
      ? mailKeys.quarantineRecord(id)
      : ([...mailKeys.quarantine(), "selected"] as const),
    queryFn: () => {
      if (!id) throw new Error("A quarantine record ID is required.");
      return mailService.getQuarantineRecord(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
