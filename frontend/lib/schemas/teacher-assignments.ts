import { z } from "zod"

export interface TeacherAssignmentDto {
  id: string
  teacherId: string
  teacherName: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  createdAt: string
}

export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateTeacherAssignmentFormValues = z.infer<typeof createTeacherAssignmentSchema>
