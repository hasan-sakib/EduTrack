import { z } from "zod"

export interface ApplicationSettingDto {
  id: string
  key: string
  value: string
  description: string | null
  updatedAt: string
}

export const updateSettingSchema = z.object({
  value: z.string().min(1, "Value is required"),
})

export type UpdateSettingFormValues = z.infer<typeof updateSettingSchema>

export interface AuditLogDto {
  id: string
  userId: string | null
  userName: string | null
  action: string
  entityName: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}
