"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ClipboardList } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { PagedResult } from "@/lib/schemas/common"
import type { AssignmentDto } from "@/lib/schemas/assignments"
import { SubmissionStatus, submissionStatusLabels, type SubmissionDto } from "@/lib/schemas/submissions"
import { useSubmissionsForAssignment } from "@/hooks/queries/use-submissions"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { GradeSubmissionDialog } from "@/components/features/submissions/grade-submission-dialog"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function useAssignmentOptions() {
  return useQuery({
    queryKey: ["assignments", "picker"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<AssignmentDto>>("/assignments", {
        params: { pageSize: 100, sortDir: "desc" },
      })
      return response.data.items
    },
  })
}

export default function SubmissionsPage() {
  return (
    <React.Suspense fallback={null}>
      <SubmissionsPageInner />
    </React.Suspense>
  )
}

function SubmissionsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assignmentIdParam = searchParams.get("assignmentId")

  const [assignmentId, setAssignmentId] = React.useState<string | undefined>(assignmentIdParam ?? undefined)
  const [status, setStatus] = React.useState<number | undefined>(undefined)
  const [page, setPage] = React.useState(1)
  const [gradingSubmission, setGradingSubmission] = React.useState<SubmissionDto | null>(null)

  const { data: assignments, isLoading: isLoadingAssignments } = useAssignmentOptions()

  React.useEffect(() => {
    if (!assignmentId && assignments && assignments.length > 0) {
      setAssignmentId(assignments[0].id)
    }
  }, [assignmentId, assignments])

  function handleAssignmentChange(id: string) {
    setAssignmentId(id)
    setStatus(undefined)
    setPage(1)
    router.replace(`/submissions?assignmentId=${id}`)
  }

  const { data, isLoading, isError } = useSubmissionsForAssignment(assignmentId, {
    page,
    pageSize: 10,
    status,
  })

  const hasAssignments = (assignments?.length ?? 0) > 0

  return (
    <div>
      <PageHeader title="Submissions" description="Review and grade student submissions." />

      {isLoadingAssignments ? (
        <div className="mb-4">
          <Skeleton className="h-9 w-72" />
        </div>
      ) : !hasAssignments ? (
        <EmptyState icon={ClipboardList} title="No assignments to review yet." />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={assignmentId} onValueChange={handleAssignmentChange}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Select an assignment" />
              </SelectTrigger>
              <SelectContent>
                {assignments?.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title} — {assignment.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status === undefined ? "all" : String(status)}
              onValueChange={(value) => {
                setStatus(value === "all" ? undefined : Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value={String(SubmissionStatus.Submitted)}>Submitted</SelectItem>
                <SelectItem value={String(SubmissionStatus.Graded)}>Graded</SelectItem>
                <SelectItem value={String(SubmissionStatus.Returned)}>Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-background">
            {isError ? (
              <div className="p-6">
                <ErrorState message="Could not load submissions. Please try again." />
              </div>
            ) : isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.studentName}</TableCell>
                        <TableCell>{format(new Date(submission.submittedAt), "PPp")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === SubmissionStatus.Graded
                                ? "default"
                                : submission.status === SubmissionStatus.Returned
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              submission.status === SubmissionStatus.Submitted
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400"
                                : undefined
                            }
                          >
                            {submissionStatusLabels[submission.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.marks ?? "—"} / {submission.maxMarks}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setGradingSubmission(submission)}>
                            {submission.status === SubmissionStatus.Submitted ? "Grade" : "Re-grade"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationFooter
                  page={data.page}
                  totalPages={data.totalPages}
                  totalCount={data.totalCount}
                  pageSize={data.pageSize}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <EmptyState icon={ClipboardList} title="No submissions yet for this assignment" />
            )}
          </div>
        </>
      )}

      <GradeSubmissionDialog
        open={!!gradingSubmission}
        onOpenChange={(open) => !open && setGradingSubmission(null)}
        submission={gradingSubmission}
      />
    </div>
  )
}
