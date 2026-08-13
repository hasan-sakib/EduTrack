"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, Download, Loader2, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { apiClient } from "@/lib/api/client"
import { useAuth } from "@/lib/auth/auth-context"
import { useAssignment } from "@/hooks/queries/use-assignments"
import { getErrorMessage } from "@/lib/api/error"
import { downloadFile } from "@/lib/api/files"
import { getDeadlineInfo } from "@/lib/deadline"
import { assignmentStatusTone, submissionStatusTone } from "@/lib/status-styles"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { AssignmentStatus, assignmentStatusLabels } from "@/lib/schemas/assignments"
import {
  SubmissionStatus,
  createSubmissionSchema,
  submissionStatusLabels,
  type CreateSubmissionFormValues,
  type SubmissionDto,
} from "@/lib/schemas/submissions"

import { PageHeader } from "@/components/features/page-header"
import { ErrorState } from "@/components/features/error-state"
import { StatusBadge } from "@/components/features/status-badge"
import { AssignmentFormDialog } from "@/components/features/assignments/assignment-form-dialog"
import { FileUploadField } from "@/components/features/file-upload-field"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { user } = useAuth()
  const isTeacher = user?.role === "Teacher"
  const isStudent = user?.role === "Student"

  const [editOpen, setEditOpen] = React.useState(false)

  const { data: assignment, isLoading, isError, refetch } = useAssignment(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !assignment) {
    return (
      <div>
        <Link
          href="/assignments"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Assignments
        </Link>
        <ErrorState message="This assignment is not available to you." onRetry={() => refetch()} />
      </div>
    )
  }

  const deadline = getDeadlineInfo(assignment.dueDate, assignment.status)

  return (
    <div>
      <PageHeader
        title={assignment.title}
        description={`${assignment.className} — ${assignment.subjectName}`}
        breadcrumbs={[{ label: "Assignments", href: "/assignments" }, { label: assignment.title }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {assignment.topic && <Badge variant="outline">{assignment.topic}</Badge>}
            <StatusBadge tone={assignmentStatusTone[assignment.status]}>
              {assignmentStatusLabels[assignment.status]}
            </StatusBadge>
            {deadline && <StatusBadge tone={deadline.tone}>{deadline.label}</StatusBadge>}
            {isTeacher && (
              <>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/submissions?assignmentId=${assignment.id}`}>View Submissions</Link>
                </Button>
              </>
            )}
          </div>
        }
      />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4 border-b pb-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{assignment.description}</p>

        <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Teacher</p>
            <p className="font-medium">{assignment.teacherName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due Date</p>
            <p className="font-medium">{format(new Date(assignment.dueDate), "PPp")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Marks</p>
            <p className="font-medium">{assignment.maxMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Allow Resubmission</p>
            <p className="font-medium">{assignment.allowResubmission ? "Yes" : "No"}</p>
          </div>
        </div>

        {assignment.attachments.length > 0 && (
          <div className="border-t pt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Attachment{assignment.attachments.length > 1 ? "s" : ""}
            </p>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-wrap gap-2">
              {assignment.attachments.map((attachment) => (
                <motion.div key={attachment.id} variants={fadeInUp}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(attachment.fileUrl, attachment.fileName)}
                  >
                    <Paperclip className="size-4" />
                    {attachment.fileName}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>

      {isStudent && assignment.status === AssignmentStatus.Published && (
        <StudentSubmissionPanel
          assignmentId={assignment.id}
          dueDate={assignment.dueDate}
          maxMarks={assignment.maxMarks}
          allowResubmission={assignment.allowResubmission}
        />
      )}

      {isTeacher && (
        <AssignmentFormDialog open={editOpen} onOpenChange={setEditOpen} assignmentToEdit={assignment} />
      )}
    </div>
  )
}

function SubmissionTimeline({ submission }: { submission: SubmissionDto | null | undefined }) {
  const isGraded = submission?.status === SubmissionStatus.Graded || submission?.status === SubmissionStatus.Returned
  const steps = [
    { key: "submitted", label: "Submitted", done: !!submission },
    {
      key: "graded",
      label: submission?.status === SubmissionStatus.Returned ? "Returned" : "Graded",
      done: !!isGraded,
    },
  ]

  return (
    <div className="mb-5 flex items-center">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border-2",
                step.done ? "border-success bg-success/10 text-success" : "border-muted-foreground/25 text-muted-foreground"
              )}
            >
              {step.done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </motion.div>
            <span className={cn("text-xs whitespace-nowrap", step.done ? "font-medium text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-2 mb-4 h-0.5 w-16 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isGraded ? 1 : 0 }}
                style={{ originX: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-success"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function StudentSubmissionPanel({
  assignmentId,
  dueDate,
  maxMarks,
  allowResubmission,
}: {
  assignmentId: string
  dueDate: string
  maxMarks: number
  allowResubmission: boolean
}) {
  const queryClient = useQueryClient()
  const submissionQueryKey = ["submissions", "mine", assignmentId]

  const { data: submission, isLoading } = useQuery({
    queryKey: submissionQueryKey,
    queryFn: async () => {
      const response = await apiClient.get<SubmissionDto>(`/assignments/${assignmentId}/submissions/mine`)
      return response.status === 204 ? null : response.data
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (values: CreateSubmissionFormValues) => {
      const response = await apiClient.post<SubmissionDto>(`/assignments/${assignmentId}/submissions`, {
        content: values.content?.trim() || null,
        fileUrl: values.fileUrl?.trim() || null,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionQueryKey })
      toast.success("Submission saved")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const form = useForm<CreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionSchema),
    defaultValues: { content: "", fileUrl: "" },
  })

  React.useEffect(() => {
    if (submission) {
      form.reset({ content: submission.content ?? "", fileUrl: submission.fileUrl ?? "" })
    }
  }, [submission, form])

  function onSubmit(values: CreateSubmissionFormValues) {
    submitMutation.mutate(values)
  }

  const deadlinePassed = new Date() >= new Date(dueDate)
  const isGraded =
    submission && (submission.status === SubmissionStatus.Graded || submission.status === SubmissionStatus.Returned)
  const canResubmit =
    submission && submission.status === SubmissionStatus.Submitted && allowResubmission && !deadlinePassed
  const showFreshForm = !submission && !deadlinePassed
  const deadlineMissedNoSubmission = !submission && deadlinePassed

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.1 }} className="pt-6">
      <h2 className="mb-3 font-semibold">Your Submission</h2>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <>
          {!deadlineMissedNoSubmission && <SubmissionTimeline submission={submission} />}

          {isGraded && submission ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-muted-foreground">Marks</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {submission.marks ?? "—"} <span className="text-base font-normal text-muted-foreground">/ {maxMarks}</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground">Feedback</p>
                <p className="whitespace-pre-wrap rounded-lg border bg-background p-3">
                  {submission.feedback || "No feedback provided."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge tone={submissionStatusTone[submission.status]}>
                  {submissionStatusLabels[submission.status]}
                </StatusBadge>
              </div>
              {submission.gradedByName && (
                <p className="text-muted-foreground">
                  Graded by {submission.gradedByName}
                  {submission.gradedAt ? ` on ${format(new Date(submission.gradedAt), "PPp")}` : ""}
                </p>
              )}
              {submission.fileUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(submission.fileUrl!, "your-submission")}
                >
                  <Download className="size-4" />
                  Download your submitted file
                </Button>
              )}
            </div>
          ) : deadlineMissedNoSubmission ? (
            <p className="text-sm text-muted-foreground">The deadline for this assignment has passed.</p>
          ) : showFreshForm || canResubmit ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your answer</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Write your answer here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attach a file (optional)</FormLabel>
                      <FormControl>
                        <FileUploadField
                          value={field.value}
                          onChange={(key) => field.onChange(key ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending && <Loader2 className="animate-spin" />}
                  {canResubmit ? "Resubmit" : "Submit"}
                </Button>
              </form>
            </Form>
          ) : submission ? (
            <div className="space-y-2 text-sm">
              <p>
                Submitted on {format(new Date(submission.submittedAt), "PPp")}
                {submission.isLate ? " (late)" : ""}.
              </p>
              <p className="text-muted-foreground">
                Your submission is awaiting grading
                {!allowResubmission
                  ? "; resubmission is not allowed for this assignment."
                  : deadlinePassed
                    ? "; the due date has passed so it can no longer be changed."
                    : "."}
              </p>
              {submission.fileUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(submission.fileUrl!, "your-submission")}
                >
                  <Download className="size-4" />
                  Download your submitted file
                </Button>
              )}
            </div>
          ) : null}
        </>
      )}
    </motion.div>
  )
}
