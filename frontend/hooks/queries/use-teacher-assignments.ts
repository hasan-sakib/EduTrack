import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { TeacherAssignmentDto, CreateTeacherAssignmentFormValues } from "@/lib/schemas/teacher-assignments"

const TEACHER_ASSIGNMENTS_KEY = "teacher-assignments"

export function useTeacherAssignments(
  query: PagedQuery & { teacherId?: string; classId?: string; subjectId?: string }
) {
  return useQuery({
    queryKey: [TEACHER_ASSIGNMENTS_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<TeacherAssignmentDto>>("/teacher-assignments", {
        params: query,
      })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateTeacherAssignmentFormValues) => {
      const response = await apiClient.post<TeacherAssignmentDto>("/teacher-assignments", values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHER_ASSIGNMENTS_KEY] })
    },
  })
}

export function useDeleteTeacherAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/teacher-assignments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHER_ASSIGNMENTS_KEY] })
    },
  })
}
