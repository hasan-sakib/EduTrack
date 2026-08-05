import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { ClassDto, CreateClassFormValues, UpdateClassFormValues } from "@/lib/schemas/classes"

const CLASSES_KEY = "classes"

export function useClasses(query: PagedQuery) {
  return useQuery({
    queryKey: [CLASSES_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ClassDto>>("/classes", { params: query })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}

export function useAllClasses() {
  return useQuery({
    queryKey: [CLASSES_KEY, "all"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ClassDto>>("/classes", { params: { pageSize: 100 } })
      return response.data.items
    },
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateClassFormValues) => {
      const response = await apiClient.post<ClassDto>("/classes", values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_KEY] })
    },
  })
}

export function useUpdateClass(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateClassFormValues) => {
      const response = await apiClient.put<ClassDto>(`/classes/${id}`, values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_KEY] })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/classes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_KEY] })
    },
  })
}
