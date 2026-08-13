"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal, School, Search, LayoutGrid, List as ListIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { useClasses, useDeleteClass } from "@/hooks/queries/use-classes"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSortState } from "@/hooks/use-sort-state"
import { getErrorMessage } from "@/lib/api/error"
import { activeStatusTone } from "@/lib/status-styles"
import { fadeIn, fadeInUp, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { classDisplayName, type ClassDto } from "@/lib/schemas/classes"

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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ClassCard({
  classItem,
  isAdmin,
  onEdit,
  onDelete,
}: {
  classItem: ClassDto
  isAdmin: boolean
  onEdit: (classItem: ClassDto) => void
  onDelete: (classItem: ClassDto) => void
}) {
  const router = useRouter()

  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Card
        onClick={() => router.push(`/classes/${classItem.id}`)}
        className="flex h-full cursor-pointer flex-col border-none bg-card shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <School className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium leading-snug">{classDisplayName(classItem)}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {classItem.description || "No description"}
              </p>
            </div>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-1 -mr-1 shrink-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuItem onSelect={() => onEdit(classItem)}>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(classItem)}>
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-3 pt-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={activeStatusTone[classItem.isActive ? "active" : "inactive"]}>
              {classItem.isActive ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <dl className="text-xs">
            <dt className="text-muted-foreground">Students</dt>
            <dd className="font-medium">{classItem.studentCount}</dd>
          </dl>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ClassesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)
  const { sortDir, toggleSort } = useSortState("name")
  const [view, setView] = React.useState<"table" | "grid">("table")

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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
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
          <ErrorState message="Could not load classes. Please try again." onRetry={() => refetch()} />
        </div>
      ) : isLoading ? (
        view === "table" ? (
          <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
            <TableSkeleton columns={isAdmin ? 5 : 4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
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
                          <TableCell className="font-medium">
                            <Link href={`/classes/${classItem.id}`} className="hover:underline">
                              {classDisplayName(classItem)}
                            </Link>
                          </TableCell>
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
            </div>
          ) : (
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3")}
              >
                {data.items.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    isAdmin={isAdmin}
                    onEdit={openEdit}
                    onDelete={setDeletingClass}
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
        </div>
      )}

      <ClassFormDialog open={formOpen} onOpenChange={setFormOpen} classToEdit={editingClass} />

      <ConfirmDeleteDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title={`Deactivate "${deletingClass ? classDisplayName(deletingClass) : ""}"?`}
        description="Students in this class will remain, but the class will no longer accept new assignments."
        isPending={deleteClass.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
