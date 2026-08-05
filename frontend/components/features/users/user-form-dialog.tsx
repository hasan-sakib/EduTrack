"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  createUserSchema,
  updateUserSchema,
  type UserDto,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/lib/schemas/users"
import { ROLES } from "@/lib/schemas/common"
import { useCreateUser, useUpdateUser } from "@/hooks/queries/use-users"
import { useAllClasses } from "@/hooks/queries/use-classes"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userToEdit?: UserDto | null
}

type UserFormValues = CreateUserFormValues & {
  isActive?: boolean
  newPassword?: string
}

export function UserFormDialog({ open, onOpenChange, userToEdit }: UserFormDialogProps) {
  const isEdit = !!userToEdit
  const createUser = useCreateUser()
  const updateUser = useUpdateUser(userToEdit?.id ?? "")
  const { data: classes } = useAllClasses()

  const form = useForm<UserFormValues>({
    resolver: (isEdit
      ? zodResolver(updateUserSchema)
      : zodResolver(createUserSchema)) as Resolver<UserFormValues>,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "Student",
      classId: null,
      isActive: true,
      newPassword: "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        fullName: userToEdit?.fullName ?? "",
        email: userToEdit?.email ?? "",
        password: "",
        role: (userToEdit?.role as UserFormValues["role"]) ?? "Student",
        classId: userToEdit?.classId ?? null,
        isActive: userToEdit?.isActive ?? true,
        newPassword: "",
      })
    }
  }, [open, userToEdit, form])

  const role = form.watch("role")

  React.useEffect(() => {
    if (role !== "Student") {
      form.setValue("classId", null)
    }
  }, [role, form])

  async function onSubmit(values: UserFormValues) {
    try {
      if (isEdit) {
        const payload: UpdateUserFormValues = {
          fullName: values.fullName,
          role: values.role,
          classId: values.classId,
          isActive: values.isActive ?? true,
          newPassword: values.newPassword || undefined,
        }
        await updateUser.mutateAsync(payload)
        toast.success("User updated")
      } else {
        await createUser.mutateAsync(values)
        toast.success("User created")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createUser.isPending || updateUser.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user details below." : "Create a new user account."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" disabled={isEdit} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {isEdit && (
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((roleOption) => (
                        <SelectItem key={roleOption} value={roleOption}>
                          {roleOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === "Student" && (
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes?.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Inactive users cannot sign in.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
