"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal, School, Search } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { useClasses, useDeleteClass } from "@/hooks/queries/use-classes"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSortState } from "@/hooks/use-sort-state"
import { getErrorMessage } from "@/lib/api/error"
import { activeStatusTone } from "@/lib/status-styles"
import { fadeIn } from "@/lib/motion"
import type { ClassDto } from "@/lib/schemas/classes"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { ClassFormDialog } from "@/components/features/classes/class-form-dialog"
import { TableSkeleton } from "@/components/features/table-skeleton"
import { StatusBadge } from "@/components/features/status-badge"
import { SortableHead } from "@/components/features/sortable-head"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ClassesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)
  const { sortDir, toggleSort } = useSortState("name")

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingClass, setEditingClass] = React.useState<ClassDto | null>(null)
  const [deletingClass, setDeletingClass] = React.useState<ClassDto | null>(null)

  const { data, isLoading, isError, refetch } = useClasses({ page, pageSize: 10, search: debouncedSearch, sortDir })
  const deleteClass = useDeleteClass()

  function openCreate() {
    setEditingClass(null)
    setFormOpen(true)
  }

  function openEdit(classItem: ClassDto) {
    setEditingClass(classItem)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingClass) return
    try {
      await deleteClass.mutateAsync(deletingClass.id)
      toast.success("Class deactivated")
      setDeletingClass(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage the classes students are organized into."
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus />
              Add Class
            </Button>
          )
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search classes..."
          className="pl-8"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load classes. Please try again." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableSkeleton columns={isAdmin ? 5 : 4} />
        ) : data && data.items.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={page} initial="hidden" animate="visible" variants={fadeIn}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Name" sortKey="name" activeSortKey="name" sortDir={sortDir} onSort={toggleSort} />
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-12" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium">{classItem.name}</TableCell>
                        <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                          {classItem.description || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{classItem.studentCount}</TableCell>
                        <TableCell>
                          <StatusBadge tone={activeStatusTone[classItem.isActive ? "active" : "inactive"]}>
                            {classItem.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
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
                                <DropdownMenuItem onSelect={() => openEdit(classItem)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDeletingClass(classItem)}
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
              </motion.div>
            </AnimatePresence>
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
            icon={School}
            title="No classes yet"
            description={
              isAdmin ? "Get started by creating your first class." : "No classes have been created yet."
            }
            action={
              isAdmin && (
                <Button onClick={openCreate}>
                  <Plus />
                  Add Class
                </Button>
              )
            }
          />
        )}
      </div>

      <ClassFormDialog open={formOpen} onOpenChange={setFormOpen} classToEdit={editingClass} />

      <ConfirmDeleteDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title={`Deactivate "${deletingClass?.name}"?`}
        description="Students in this class will remain, but the class will no longer accept new assignments."
        isPending={deleteClass.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
