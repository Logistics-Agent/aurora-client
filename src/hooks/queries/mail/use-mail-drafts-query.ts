"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";
import type { DraftListParams } from "@/dto/mail/mail.dto";

export function useMailDraftsQuery(params: DraftListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mailKeys.drafts(params),
    queryFn: () => mailService.listDrafts(params),
    enabled: options?.enabled ?? true,
  });
}
