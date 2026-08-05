import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { ApplicationSettingDto } from "@/lib/schemas/settings"

const SETTINGS_KEY = "settings"

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: async () => {
      const response = await apiClient.get<ApplicationSettingDto[]>("/settings")
      return response.data
    },
  })
}

export function useUpdateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { key: string; value: string }) => {
      const response = await apiClient.put<ApplicationSettingDto>(`/settings/${vars.key}`, {
        value: vars.value,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] })
    },
  })
}
