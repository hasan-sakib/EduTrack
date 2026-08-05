import { z } from "zod"

export const AssignmentStatus = {
  Draft: 0,
  Published: 1,
  Closed: 2,
} as const

export type AssignmentStatusValue = (typeof AssignmentStatus)[keyof typeof AssignmentStatus]

export const assignmentStatusLabels: Record<AssignmentStatusValue, string> = {
  [AssignmentStatus.Draft]: "Draft",
  [AssignmentStatus.Published]: "Published",
  [AssignmentStatus.Closed]: "Closed",
}

export interface AssignmentDto {
  id: string
  title: string
  description: string
  maxMarks: number
  dueDate: string
  status: AssignmentStatusValue
  allowResubmission: boolean
  attachmentUrl: string | null
  teacherAssignmentId: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  createdAt: string
  updatedAt: string
}

export const createAssignmentSchema = z.object({
  teacherAssignmentId: z.string().min(1, "Class & subject is required"),
  title: z.string().min(1, "Title is required").max(256),
  description: z.string().min(1, "Description is required"),
  maxMarks: z.coerce.number().int().positive("Max marks must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  allowResubmission: z.boolean(),
})

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>

export const updateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(256),
  description: z.string().min(1, "Description is required"),
  maxMarks: z.coerce.number().int().positive("Max marks must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  allowResubmission: z.boolean(),
})

export type UpdateAssignmentFormValues = z.infer<typeof updateAssignmentSchema>
