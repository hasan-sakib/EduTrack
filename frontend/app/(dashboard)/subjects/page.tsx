"use client"

import * as React from "react"
import { Plus, MoreHorizontal, BookOpen, Search } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { useSubjects, useDeleteSubject } from "@/hooks/queries/use-subjects"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/error"
import type { SubjectDto } from "@/lib/schemas/subjects"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { SubjectFormDialog } from "@/components/features/subjects/subject-form-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SubjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<SubjectDto | null>(null)
  const [deletingSubject, setDeletingSubject] = React.useState<SubjectDto | null>(null)

  const { data, isLoading, isError } = useSubjects({ page, pageSize: 10, search: debouncedSearch })
  const deleteSubject = useDeleteSubject()

  function openCreate() {
    setEditingSubject(null)
    setFormOpen(true)
  }

  function openEdit(subject: SubjectDto) {
    setEditingSubject(subject)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingSubject) return
    try {
      await deleteSubject.mutateAsync(deletingSubject.id)
      toast.success("Subject deactivated")
      setDeletingSubject(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage the subjects taught across your school."
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus />
              Add Subject
            </Button>
          )
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search subjects..."
          className="pl-8"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="rounded-lg border bg-background">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load subjects. Please try again." />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subject.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subject.isActive ? "default" : "secondary"}>
                        {subject.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(subject)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeletingSubject(subject)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description={
              isAdmin ? "Get started by creating your first subject." : "No subjects have been created yet."
            }
            action={
              isAdmin && (
                <Button onClick={openCreate}>
                  <Plus />
                  Add Subject
                </Button>
              )
            }
          />
        )}
      </div>

      <SubjectFormDialog open={formOpen} onOpenChange={setFormOpen} subjectToEdit={editingSubject} />

      <ConfirmDeleteDialog
        open={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
        title={`Deactivate "${deletingSubject?.name}"?`}
        description="This subject will no longer be available for new assignments."
        isPending={deleteSubject.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
