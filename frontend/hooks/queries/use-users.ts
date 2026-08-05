import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { PagedQuery, PagedResult } from "@/lib/schemas/common"
import type { UserDto, CreateUserFormValues, UpdateUserFormValues } from "@/lib/schemas/users"

const USERS_KEY = "users"

export function useUsers(query: PagedQuery & { role?: string; classId?: string }) {
  return useQuery({
    queryKey: [USERS_KEY, query],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<UserDto>>("/users", { params: query })
      return response.data
    },
    placeholderData: (previous) => previous,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      const response = await apiClient.post<UserDto>("/users", values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateUserFormValues) => {
      const response = await apiClient.put<UserDto>(`/users/${id}`, values)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}
