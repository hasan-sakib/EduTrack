import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { SubjectDto, CreateSubjectFormValues, UpdateSubjectFormValues } from "@/lib/schemas/subjects"

const SUBJECTS_KEY = "subjects"

export function useSubjects(query: PagedQuery) {
  return useQuery({
    queryKey: [SUBJECTS_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SubjectDto>>("/subjects", { params: query })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}

export function useAllSubjects() {
  return useQuery({
    queryKey: [SUBJECTS_KEY, "all"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SubjectDto>>("/subjects", { params: { pageSize: 100 } })
      return response.data.items
    },
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateSubjectFormValues) => {
      const response = await apiClient.post<SubjectDto>("/subjects", values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] })
    },
  })
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateSubjectFormValues) => {
      const response = await apiClient.put<SubjectDto>(`/subjects/${id}`, values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] })
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subjects/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] })
    },
  })
}
