"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal, ClipboardList, Search, LayoutGrid, List as ListIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import {
  useAssignments,
  useDeleteAssignment,
  useUpdateAssignmentStatus,
} from "@/hooks/queries/use-assignments"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSortState } from "@/hooks/use-sort-state"
import { getErrorMessage } from "@/lib/api/error"
import { getDeadlineInfo } from "@/lib/deadline"
import { assignmentStatusTone } from "@/lib/status-styles"
import { fadeIn, fadeInUp, staggerContainer } from "@/lib/motion"
import { AssignmentStatus, assignmentStatusLabels, type AssignmentDto } from "@/lib/schemas/assignments"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { AssignmentFormDialog } from "@/components/features/assignments/assignment-form-dialog"
import { TableSkeleton } from "@/components/features/table-skeleton"
import { StatusBadge } from "@/components/features/status-badge"
import { SortableHead } from "@/components/features/sortable-head"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function AssignmentActions({
  assignment,
  onEdit,
  onDelete,
  trigger,
}: {
  assignment: AssignmentDto
  onEdit: (assignment: AssignmentDto) => void
  onDelete: (assignment: AssignmentDto) => void
  trigger: React.ReactNode
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={updateStatus.isPending}>
        {trigger}
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
  )
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
  const deadline = getDeadlineInfo(assignment.dueDate, assignment.status)

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/assignments/${assignment.id}`} className="hover:underline">
          {assignment.title}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">{assignment.className}</TableCell>
      <TableCell className="hidden md:table-cell">{assignment.subjectName}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span>{format(new Date(assignment.dueDate), "PPp")}</span>
          {deadline && (
            <StatusBadge tone={deadline.tone} className="w-fit text-[11px]">
              {deadline.label}
            </StatusBadge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{assignment.maxMarks}</TableCell>
      <TableCell>
        <StatusBadge tone={assignmentStatusTone[assignment.status]}>
          {assignmentStatusLabels[assignment.status]}
        </StatusBadge>
      </TableCell>
      {isTeacher ? (
        <TableCell>
          <AssignmentActions
            assignment={assignment}
            onEdit={onEdit}
            onDelete={onDelete}
            trigger={
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
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

function AssignmentCard({
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
  const deadline = getDeadlineInfo(assignment.dueDate, assignment.status)

  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Card className="flex h-full flex-col shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="min-w-0">
            <Link
              href={`/assignments/${assignment.id}`}
              className="line-clamp-2 font-medium leading-snug hover:underline"
            >
              {assignment.title}
            </Link>
            <p className="mt-1 truncate text-xs text-muted-foreground">{assignment.subjectName}</p>
          </div>
          {isTeacher ? (
            <AssignmentActions
              assignment={assignment}
              onEdit={onEdit}
              onDelete={onDelete}
              trigger={
                <Button variant="ghost" size="icon" className="-mt-1 -mr-1 shrink-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
          ) : (
            <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1 shrink-0" asChild>
              <Link href={`/assignments/${assignment.id}`}>
                <ListIcon className="size-3.5" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-3 pt-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={assignmentStatusTone[assignment.status]}>
              {assignmentStatusLabels[assignment.status]}
            </StatusBadge>
            {deadline && <StatusBadge tone={deadline.tone}>{deadline.label}</StatusBadge>}
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            <div>
              <dt className="text-muted-foreground">Class</dt>
              <dd className="font-medium">{assignment.className}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Max marks</dt>
              <dd className="font-medium">{assignment.maxMarks}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Teacher</dt>
              <dd className="truncate font-medium">{assignment.teacherName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due</dt>
              <dd className="font-medium">{format(new Date(assignment.dueDate), "PP")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </motion.div>
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
  const [view, setView] = React.useState<"table" | "grid">("table")
  const { sortDir, toggleSort } = useSortState("dueDate")

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingAssignment, setEditingAssignment] = React.useState<AssignmentDto | null>(null)
  const [deletingAssignment, setDeletingAssignment] = React.useState<AssignmentDto | null>(null)

  const { data, isLoading, isError, refetch } = useAssignments({
    page,
    pageSize: 10,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : Number(statusFilter),
    sortDir,
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
        <div className="inline-flex shrink-0 items-center gap-0.5 self-start rounded-md border bg-background p-0.5 sm:self-auto">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("table")}
            aria-label="Table view"
          >
            <ListIcon className="size-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border bg-background p-6 shadow-sm">
          <ErrorState message="Could not load assignments. Please try again." onRetry={() => refetch()} />
        </div>
      ) : isLoading ? (
        view === "table" ? (
          <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
            <TableSkeleton columns={isTeacher ? 6 : 5} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-lg" />
            ))}
          </div>
        )
      ) : data && data.items.length > 0 ? (
        <>
          {view === "table" ? (
            <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div key={page} initial="hidden" animate="visible" variants={fadeIn}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Class</TableHead>
                        <TableHead className="hidden md:table-cell">Subject</TableHead>
                        <SortableHead
                          label="Due Date"
                          sortKey="dueDate"
                          activeSortKey="dueDate"
                          sortDir={sortDir}
                          onSort={toggleSort}
                        />
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
                </motion.div>
              </AnimatePresence>
              <PaginationFooter
                page={data.page}
                totalPages={data.totalPages}
                totalCount={data.totalCount}
                pageSize={data.pageSize}
                onPageChange={setPage}
              />
            </div>
          ) : (
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3")}
              >
                {data.items.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    isTeacher={isTeacher}
                    onEdit={openEdit}
                    onDelete={setDeletingAssignment}
                  />
                ))}
              </motion.div>
              <div className="mt-4 rounded-lg border bg-background shadow-sm">
                <PaginationFooter
                  page={data.page}
                  totalPages={data.totalPages}
                  totalCount={data.totalCount}
                  pageSize={data.pageSize}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border bg-background shadow-sm">
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
        </div>
      )}

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
