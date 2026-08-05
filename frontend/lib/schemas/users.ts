import { z } from "zod"
import { ROLES } from "@/lib/schemas/common"

export interface UserDto {
  id: string
  fullName: string
  email: string
  role: string
  classId: string | null
  className: string | null
  isActive: boolean
  createdAt: string
}

export const createUserSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(256),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(ROLES),
    classId: z.string().optional().nullable(),
  })
  .refine((data) => data.role !== "Student" || !!data.classId, {
    message: "A class must be selected for Student users",
    path: ["classId"],
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(256),
    role: z.enum(ROLES),
    classId: z.string().optional().nullable(),
    isActive: z.boolean(),
    newPassword: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  })
  .refine((data) => data.role !== "Student" || !!data.classId, {
    message: "A class must be selected for Student users",
    path: ["classId"],
  })

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
