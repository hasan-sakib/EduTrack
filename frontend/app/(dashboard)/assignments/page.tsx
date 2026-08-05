"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, ClipboardList, Search } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import {
  useAssignments,
  useDeleteAssignment,
  useUpdateAssignmentStatus,
} from "@/hooks/queries/use-assignments"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/error"
import { AssignmentStatus, assignmentStatusLabels, type AssignmentDto } from "@/lib/schemas/assignments"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { AssignmentFormDialog } from "@/components/features/assignments/assignment-form-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusBadgeVariant: Record<number, "secondary" | "default" | "outline"> = {
  [AssignmentStatus.Draft]: "secondary",
  [AssignmentStatus.Published]: "default",
  [AssignmentStatus.Closed]: "outline",
}

function AssignmentRow({
  assignment,
  isTeacher,
  onEdit,
  onDelete,
}: {
  assignment: AssignmentDto
  isTeacher: boolean
  onEdit: (assignment: AssignmentDto) => void
  onDelete: (assignment: AssignmentDto) => void
}) {
  const updateStatus = useUpdateAssignmentStatus(assignment.id)

  function handlePublish() {
    updateStatus.mutate(AssignmentStatus.Published, {
      onSuccess: () => toast.success("Assignment published"),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  function handleClose() {
    updateStatus.mutate(AssignmentStatus.Closed, {
      onSuccess: () => toast.success("Assignment closed"),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/assignments/${assignment.id}`} className="hover:underline">
          {assignment.title}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">{assignment.className}</TableCell>
      <TableCell className="hidden md:table-cell">{assignment.subjectName}</TableCell>
      <TableCell>{format(new Date(assignment.dueDate), "PPp")}</TableCell>
      <TableCell className="hidden sm:table-cell">{assignment.maxMarks}</TableCell>
      <TableCell>
        <Badge variant={statusBadgeVariant[assignment.status]}>
          {assignmentStatusLabels[assignment.status]}
        </Badge>
      </TableCell>
      {isTeacher ? (
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={updateStatus.isPending}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/assignments/${assignment.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(assignment)}>Edit</DropdownMenuItem>
              {assignment.status === AssignmentStatus.Draft && (
                <DropdownMenuItem onSelect={handlePublish}>Publish</DropdownMenuItem>
              )}
              {assignment.status === AssignmentStatus.Published && (
                <DropdownMenuItem onSelect={handleClose}>Close</DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(assignment)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      ) : (
        <TableCell>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/assignments/${assignment.id}`}>View</Link>
          </Button>
        </TableCell>
      )}
    </TableRow>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const isTeacher = user?.role === "Teacher"
  const isStudent = user?.role === "Student"

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingAssignment, setEditingAssignment] = React.useState<AssignmentDto | null>(null)
  const [deletingAssignment, setDeletingAssignment] = React.useState<AssignmentDto | null>(null)

  const { data, isLoading, isError } = useAssignments({
    page,
    pageSize: 10,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : Number(statusFilter),
  })
  const deleteAssignment = useDeleteAssignment()

  function openCreate() {
    setEditingAssignment(null)
    setFormOpen(true)
  }

  function openEdit(assignment: AssignmentDto) {
    setEditingAssignment(assignment)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingAssignment) return
    try {
      await deleteAssignment.mutateAsync(deletingAssignment.id)
      toast.success("Assignment deleted")
      setDeletingAssignment(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Manage assignments and track student submissions."
        action={
          isTeacher && (
            <Button onClick={openCreate}>
              <Plus />
              Create Assignment
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-8"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
        {!isStudent && (
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={String(AssignmentStatus.Draft)}>Draft</SelectItem>
              <SelectItem value={String(AssignmentStatus.Published)}>Published</SelectItem>
              <SelectItem value={String(AssignmentStatus.Closed)}>Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-lg border bg-background">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load assignments. Please try again." />
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                  {isTeacher ? <TableHead className="w-12" /> : <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    isTeacher={isTeacher}
                    onEdit={openEdit}
                    onDelete={setDeletingAssignment}
                  />
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
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            description={
              isTeacher
                ? "Get started by creating your first assignment."
                : "No assignments have been posted yet."
            }
            action={
              isTeacher && (
                <Button onClick={openCreate}>
                  <Plus />
                  Create Assignment
                </Button>
              )
            }
          />
        )}
      </div>

      <AssignmentFormDialog open={formOpen} onOpenChange={setFormOpen} assignmentToEdit={editingAssignment} />

      <ConfirmDeleteDialog
        open={!!deletingAssignment}
        onOpenChange={(open) => !open && setDeletingAssignment(null)}
        title={`Delete "${deletingAssignment?.title}"?`}
        description="This cannot be undone. Assignments with existing submissions cannot be deleted."
        isPending={deleteAssignment.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
