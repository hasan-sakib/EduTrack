import { z } from "zod"

export interface ClassDto {
  id: string
  name: string
  description: string | null
  isActive: boolean
  studentCount: number
  createdAt: string
}

export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  description: z.string().max(1024).optional().or(z.literal("")),
})

export type CreateClassFormValues = z.infer<typeof createClassSchema>

export const updateClassSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  description: z.string().max(1024).optional().or(z.literal("")),
  isActive: z.boolean(),
})

export type UpdateClassFormValues = z.infer<typeof updateClassSchema>
