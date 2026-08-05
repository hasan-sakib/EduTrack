"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal, Users as UsersIcon, Search, GraduationCap } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { useUsers, useDeleteUser } from "@/hooks/queries/use-users"
import { useTeacherAssignments, useDeleteTeacherAssignment } from "@/hooks/queries/use-teacher-assignments"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSortState } from "@/hooks/use-sort-state"
import { getErrorMessage } from "@/lib/api/error"
import { getInitials } from "@/lib/utils"
import { activeStatusTone, roleTone } from "@/lib/status-styles"
import { fadeIn } from "@/lib/motion"
import { ROLES, type Role } from "@/lib/schemas/common"
import type { UserDto } from "@/lib/schemas/users"
import type { TeacherAssignmentDto } from "@/lib/schemas/teacher-assignments"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { UserFormDialog } from "@/components/features/users/user-form-dialog"
import { TeacherAssignmentDialog } from "@/components/features/users/teacher-assignment-dialog"
import { TableSkeleton } from "@/components/features/table-skeleton"
import { StatusBadge } from "@/components/features/status-badge"
import { SortableHead } from "@/components/features/sortable-head"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLE_FILTER_ALL = "all"

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts and teacher assignments." />
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assignments">Teacher Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="assignments">
          <TeacherAssignmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UsersTab() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)
  const [roleFilter, setRoleFilter] = React.useState<string>(ROLE_FILTER_ALL)
  const { sortBy, sortDir, toggleSort } = useSortState()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserDto | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<UserDto | null>(null)

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    pageSize: 10,
    search: debouncedSearch,
    role: roleFilter === ROLE_FILTER_ALL ? undefined : roleFilter,
    sortBy,
    sortDir,
  })
  const deleteUser = useDeleteUser()

  function openCreate() {
    setEditingUser(null)
    setFormOpen(true)
  }

  function openEdit(userItem: UserDto) {
    setEditingUser(userItem)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingUser) return
    try {
      await deleteUser.mutateAsync(deletingUser.id)
      toast.success("User deactivated")
      setDeletingUser(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button onClick={openCreate}>
            <Plus />
            Add User
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ROLE_FILTER_ALL}>All Roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load users. Please try again." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableSkeleton columns={isAdmin ? 6 : 5} />
        ) : data && data.items.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={page} initial="hidden" animate="visible" variants={fadeIn}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead
                        label="Full Name"
                        sortKey="fullName"
                        activeSortKey={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                      />
                      <SortableHead
                        label="Email"
                        sortKey="email"
                        activeSortKey={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                      />
                      <TableHead>Role</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-12" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7">
                              <AvatarFallback className="bg-accent text-[11px] text-accent-foreground">
                                {getInitials(userItem.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            {userItem.fullName}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{userItem.email}</TableCell>
                        <TableCell>
                          <StatusBadge tone={roleTone[userItem.role as Role]}>{userItem.role}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{userItem.className || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge tone={activeStatusTone[userItem.isActive ? "active" : "inactive"]}>
                            {userItem.isActive ? "Active" : "Inactive"}
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
                                <DropdownMenuItem onSelect={() => openEdit(userItem)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDeletingUser(userItem)}
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
            icon={UsersIcon}
            title="No users yet"
            description={isAdmin ? "Get started by creating your first user." : "No users have been created yet."}
            action={
              isAdmin && (
                <Button onClick={openCreate}>
                  <Plus />
                  Add User
                </Button>
              )
            }
          />
        )}
      </div>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} userToEdit={editingUser} />

      <ConfirmDeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title={`Deactivate "${deletingUser?.fullName}"?`}
        description="This user will no longer be able to sign in."
        isPending={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function TeacherAssignmentsTab() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const [page, setPage] = React.useState(1)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [deletingAssignment, setDeletingAssignment] = React.useState<TeacherAssignmentDto | null>(null)

  const { data, isLoading, isError, refetch } = useTeacherAssignments({ page, pageSize: 10 })
  const deleteTeacherAssignment = useDeleteTeacherAssignment()

  async function confirmDelete() {
    if (!deletingAssignment) return
    try {
      await deleteTeacherAssignment.mutateAsync(deletingAssignment.id)
      toast.success("Teacher assignment removed")
      setDeletingAssignment(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAssignOpen(true)}>
            <Plus />
            Assign Teacher
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load teacher assignments. Please try again." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableSkeleton columns={isAdmin ? 4 : 3} />
        ) : data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.teacherName}</TableCell>
                    <TableCell>{assignment.className}</TableCell>
                    <TableCell>{assignment.subjectName}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeletingAssignment(assignment)}
                            >
                              Remove
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
            icon={GraduationCap}
            title="No teacher assignments yet"
            description={
              isAdmin
                ? "Assign a teacher to a class and subject to let them create assignments."
                : "No teacher assignments have been created yet."
            }
            action={
              isAdmin && (
                <Button onClick={() => setAssignOpen(true)}>
                  <Plus />
                  Assign Teacher
                </Button>
              )
            }
          />
        )}
      </div>

      <TeacherAssignmentDialog open={assignOpen} onOpenChange={setAssignOpen} />

      <ConfirmDeleteDialog
        open={!!deletingAssignment}
        onOpenChange={(open) => !open && setDeletingAssignment(null)}
        title="Remove teacher assignment?"
        description={`${deletingAssignment?.teacherName} will no longer be able to create assignments for ${deletingAssignment?.className} — ${deletingAssignment?.subjectName}.`}
        isPending={deleteTeacherAssignment.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
