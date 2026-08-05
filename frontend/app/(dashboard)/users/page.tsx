"use client"

import * as React from "react"
import { Plus, MoreHorizontal, Users as UsersIcon, Search, GraduationCap } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { useUsers, useDeleteUser } from "@/hooks/queries/use-users"
import { useTeacherAssignments, useDeleteTeacherAssignment } from "@/hooks/queries/use-teacher-assignments"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/error"
import { ROLES } from "@/lib/schemas/common"
import type { UserDto } from "@/lib/schemas/users"
import type { TeacherAssignmentDto } from "@/lib/schemas/teacher-assignments"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { ConfirmDeleteDialog } from "@/components/features/confirm-delete-dialog"
import { UserFormDialog } from "@/components/features/users/user-form-dialog"
import { TeacherAssignmentDialog } from "@/components/features/users/teacher-assignment-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserDto | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<UserDto | null>(null)

  const { data, isLoading, isError } = useUsers({
    page,
    pageSize: 10,
    search: debouncedSearch,
    role: roleFilter === ROLE_FILTER_ALL ? undefined : roleFilter,
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

      <div className="rounded-lg border bg-background">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load users. Please try again." />
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
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">{userItem.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{userItem.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{userItem.role}</Badge>
                    </TableCell>
                    <TableCell>{userItem.className || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={userItem.isActive ? "default" : "secondary"}>
                        {userItem.isActive ? "Active" : "Inactive"}
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

  const { data, isLoading, isError } = useTeacherAssignments({ page, pageSize: 10 })
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

      <div className="rounded-lg border bg-background">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Could not load teacher assignments. Please try again." />
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
