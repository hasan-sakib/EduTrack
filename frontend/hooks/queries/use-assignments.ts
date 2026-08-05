import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type {
  AssignmentDto,
  AssignmentStatusValue,
  CreateAssignmentFormValues,
  UpdateAssignmentFormValues,
} from "@/lib/schemas/assignments"

const ASSIGNMENTS_KEY = "assignments"

export type AssignmentsQuery = PagedQuery & {
  status?: number
  classId?: string
  subjectId?: string
}

export function useAssignments(query: AssignmentsQuery) {
  return useQuery({
    queryKey: [ASSIGNMENTS_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<AssignmentDto>>("/assignments", { params: query })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: [ASSIGNMENTS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<AssignmentDto>(`/assignments/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateAssignmentFormValues) => {
      const response = await apiClient.post<AssignmentDto>("/assignments", values)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY, data.id] })
    },
  })
}

export function useUpdateAssignment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateAssignmentFormValues) => {
      const response = await apiClient.put<AssignmentDto>(`/assignments/${id}`, values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY, id] })
    },
  })
}

export function useUpdateAssignmentStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (status: AssignmentStatusValue) => {
      const response = await apiClient.patch<AssignmentDto>(`/assignments/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY, id] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/assignments/${id}`)
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY, id] })
    },
  })
}
