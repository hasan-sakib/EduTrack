import { z } from "zod"

export interface SubjectDto {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
}

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  code: z.string().min(1, "Code is required").max(32),
})

export type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>

export const updateSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  code: z.string().min(1, "Code is required").max(32),
  isActive: z.boolean(),
})

export type UpdateSubjectFormValues = z.infer<typeof updateSubjectSchema>
