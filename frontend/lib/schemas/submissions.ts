import { z } from "zod"

export const SubmissionStatus = {
  Submitted: 0,
  Graded: 1,
  Returned: 2,
} as const

export type SubmissionStatusValue = (typeof SubmissionStatus)[keyof typeof SubmissionStatus]

export const submissionStatusLabels: Record<SubmissionStatusValue, string> = {
  [SubmissionStatus.Submitted]: "Submitted",
  [SubmissionStatus.Graded]: "Graded",
  [SubmissionStatus.Returned]: "Returned",
}

export interface SubmissionDto {
  id: string
  assignmentId: string
  assignmentTitle: string
  maxMarks: number
  studentId: string
  studentName: string
  content: string | null
  fileUrl: string | null
  submittedAt: string
  isLate: boolean
  status: SubmissionStatusValue
  marks: number | null
  feedback: string | null
  gradedAt: string | null
  gradedByName: string | null
}

export const createSubmissionSchema = z
  .object({
    content: z.string().optional().or(z.literal("")),
    fileUrl: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !!data.content?.trim() || !!data.fileUrl?.trim(), {
    message: "Provide either written content or a file attachment",
    path: ["content"],
  })

export type CreateSubmissionFormValues = z.infer<typeof createSubmissionSchema>

export const gradeSubmissionSchema = z.object({
  marks: z.coerce.number().int().min(0, "Marks cannot be negative"),
  feedback: z.string().optional().or(z.literal("")),
  status: z.coerce.number().refine((v) => v === SubmissionStatus.Graded || v === SubmissionStatus.Returned),
})

export type GradeSubmissionFormValues = z.infer<typeof gradeSubmissionSchema>
