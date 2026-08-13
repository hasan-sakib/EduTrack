"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api/client"
import type { PagedResult } from "@/lib/schemas/common"
import type { UserDto } from "@/lib/schemas/users"
import {
  createTeacherAssignmentSchema,
  type CreateTeacherAssignmentFormValues,
} from "@/lib/schemas/teacher-assignments"
import { useCreateTeacherAssignment } from "@/hooks/queries/use-teacher-assignments"
import { useAllClasses } from "@/hooks/queries/use-classes"
import { classDisplayName } from "@/lib/schemas/classes"
import { useAllSubjects } from "@/hooks/queries/use-subjects"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TeacherAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useAllTeachers() {
  return useQuery({
    queryKey: ["users", "all-teachers"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<UserDto>>("/users", {
        params: { role: "Teacher", pageSize: 100 },
      })
      return response.data.items
    },
  })
}

export function TeacherAssignmentDialog({ open, onOpenChange }: TeacherAssignmentDialogProps) {
  const createTeacherAssignment = useCreateTeacherAssignment()
  const { data: teachers } = useAllTeachers()
  const { data: classes } = useAllClasses()
  const { data: subjects } = useAllSubjects()

  const form = useForm<CreateTeacherAssignmentFormValues>({
    resolver: zodResolver(createTeacherAssignmentSchema),
    defaultValues: { teacherId: "", classId: "", subjectId: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ teacherId: "", classId: "", subjectId: "" })
    }
  }, [open, form])

  async function onSubmit(values: CreateTeacherAssignmentFormValues) {
    try {
      await createTeacherAssignment.mutateAsync(values)
      toast.success("Teacher assignment created")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createTeacherAssignment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign teacher</DialogTitle>
          <DialogDescription>
            Grant a teacher permission to create assignments for a class and subject.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers?.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes?.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classDisplayName(classItem)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Assign teacher
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
