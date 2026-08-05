import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { AuditLogDto } from "@/lib/schemas/settings"

const AUDIT_LOGS_KEY = "audit-logs"

export type AuditLogQuery = PagedQuery & { entityName?: string }

export function useAuditLogs(query: AuditLogQuery) {
  return useQuery({
    queryKey: [AUDIT_LOGS_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<AuditLogDto>>("/audit-logs", { params: query })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}
