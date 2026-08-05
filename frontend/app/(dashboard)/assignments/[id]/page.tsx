"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { apiClient } from "@/lib/api/client"
import { useAuth } from "@/lib/auth/auth-context"
import { useAssignment } from "@/hooks/queries/use-assignments"
import { getErrorMessage } from "@/lib/api/error"
import { AssignmentStatus, assignmentStatusLabels } from "@/lib/schemas/assignments"
import {
  SubmissionStatus,
  createSubmissionSchema,
  submissionStatusLabels,
  type CreateSubmissionFormValues,
  type SubmissionDto,
} from "@/lib/schemas/submissions"

import { ErrorState } from "@/components/features/error-state"
import { AssignmentFormDialog } from "@/components/features/assignments/assignment-form-dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const statusBadgeVariant: Record<number, "secondary" | "default" | "outline"> = {
  [AssignmentStatus.Draft]: "secondary",
  [AssignmentStatus.Published]: "default",
  [AssignmentStatus.Closed]: "outline",
}

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { user } = useAuth()
  const isTeacher = user?.role === "Teacher"
  const isStudent = user?.role === "Student"

  const [editOpen, setEditOpen] = React.useState(false)

  const { data: assignment, isLoading, isError } = useAssignment(id)

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
        <ErrorState message="This assignment is not available to you." />
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/assignments"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Assignments
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{assignment.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {assignment.className} — {assignment.subjectName}
            </p>
          </div>
          <Badge variant={statusBadgeVariant[assignment.status]}>
            {assignmentStatusLabels[assignment.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm">{assignment.description}</p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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

          {isTeacher && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/submissions?assignmentId=${assignment.id}`}>View Submissions</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isStudent && assignment.status === AssignmentStatus.Published && (
        <StudentSubmissionPanel assignmentId={assignment.id} dueDate={assignment.dueDate} maxMarks={assignment.maxMarks} allowResubmission={assignment.allowResubmission} />
      )}

      {isTeacher && (
        <AssignmentFormDialog open={editOpen} onOpenChange={setEditOpen} assignmentToEdit={assignment} />
      )}
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
        fileUrl: null,
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Submission</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isGraded && submission ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Marks</p>
              <p className="text-lg font-semibold">
                {submission.marks ?? "—"} / {maxMarks}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Feedback</p>
              <p className="whitespace-pre-wrap">{submission.feedback || "No feedback provided."}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline">{submissionStatusLabels[submission.status]}</Badge>
            </div>
            {submission.gradedByName && (
              <p className="text-muted-foreground">
                Graded by {submission.gradedByName}
                {submission.gradedAt ? ` on ${format(new Date(submission.gradedAt), "PPp")}` : ""}
              </p>
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
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
