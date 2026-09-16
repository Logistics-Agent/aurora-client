"use client";

import { useQuery } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { mailService } from "@/api/services/mail.service";
import type { QuarantineListParams } from "@/dto/mail/mail.dto";

export function useQuarantineQuery(
  params: QuarantineListParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: mailKeys.quarantine(params),
    queryFn: () => mailService.listQuarantine(params),
    enabled: options?.enabled ?? true,
  });
}
