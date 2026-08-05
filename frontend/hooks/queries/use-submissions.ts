import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { GradeSubmissionFormValues, SubmissionDto } from "@/lib/schemas/submissions"

const SUBMISSIONS_KEY = "submissions"

export function useSubmissionsForAssignment(
  assignmentId: string | undefined,
  query: PagedQuery & { status?: number }
) {
  return useQuery({
    queryKey: [SUBMISSIONS_KEY, assignmentId, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SubmissionDto>>(
        `/assignments/${assignmentId}/submissions`,
        { params: query }
      )
      return response.data
    },
    enabled: !!assignmentId,
    placeholderData: (previous) => previous,
  })
}

export function useGradeSubmission(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: GradeSubmissionFormValues) => {
      const response = await apiClient.patch<SubmissionDto>(`/submissions/${id}/grade`, values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_KEY] })
    },
  })
}
