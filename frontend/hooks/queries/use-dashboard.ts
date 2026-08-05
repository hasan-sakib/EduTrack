import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedResult } from "@/lib/schemas/common"
import type { AssignmentDto } from "@/lib/schemas/assignments"

function useCount(key: string, url: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard-count", key],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<unknown>>(url, { params: { page: 1, pageSize: 1 } })
      return response.data.totalCount
    },
    enabled,
  })
}

export function useUserCount(enabled: boolean) {
  return useCount("users", "/users", enabled)
}

export function useClassCount() {
  return useCount("classes", "/classes")
}

export function useSubjectCount() {
  return useCount("subjects", "/subjects")
}

export function useAssignmentCount() {
  return useCount("assignments", "/assignments")
}

export function useUpcomingAssignments() {
  return useQuery({
    queryKey: ["dashboard-upcoming-assignments"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<AssignmentDto>>("/assignments", {
        params: { page: 1, pageSize: 5, sortDir: "asc" },
      })
      return response.data.items
    },
  })
}
