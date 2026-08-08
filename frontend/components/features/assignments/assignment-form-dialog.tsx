"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api/client"
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  type AssignmentDto,
  type CreateAssignmentFormValues,
  type UpdateAssignmentFormValues,
} from "@/lib/schemas/assignments"
import type { PagedResult } from "@/lib/schemas/common"
import { useCreateAssignment, useUpdateAssignment } from "@/hooks/queries/use-assignments"
import { getErrorMessage } from "@/lib/api/error"
import { DateTimePicker } from "@/components/features/date-time-picker"
import { FileUploadField } from "@/components/features/file-upload-field"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeacherAssignmentDto {
  id: string
  teacherId: string
  teacherName: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  createdAt: string
}

interface AssignmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentToEdit?: AssignmentDto | null
}

type FormValues = CreateAssignmentFormValues

export function AssignmentFormDialog({ open, onOpenChange, assignmentToEdit }: AssignmentFormDialogProps) {
  const isEdit = !!assignmentToEdit
  const createAssignment = useCreateAssignment()
  const updateAssignment = useUpdateAssignment(assignmentToEdit?.id ?? "")

  const { data: teacherAssignments, isLoading: isLoadingTeacherAssignments } = useQuery({
    queryKey: ["teacher-assignments", "form-options"],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<TeacherAssignmentDto>>("/teacher-assignments", {
        params: { pageSize: 100 },
      })
      return response.data.items
    },
    enabled: open && !isEdit,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateAssignmentSchema : createAssignmentSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      teacherAssignmentId: "",
      title: "",
      description: "",
      maxMarks: 100,
      dueDate: "",
      allowResubmission: false,
      attachmentUrl: null,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        teacherAssignmentId: assignmentToEdit?.teacherAssignmentId ?? "",
        title: assignmentToEdit?.title ?? "",
        description: assignmentToEdit?.description ?? "",
        maxMarks: assignmentToEdit?.maxMarks ?? 100,
        dueDate: assignmentToEdit?.dueDate ?? "",
        allowResubmission: assignmentToEdit?.allowResubmission ?? false,
        attachmentUrl: assignmentToEdit?.attachmentUrl ?? null,
      })
    }
  }, [open, assignmentToEdit, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        const updateValues: UpdateAssignmentFormValues = {
          title: values.title,
          description: values.description,
          maxMarks: values.maxMarks,
          dueDate: values.dueDate,
          allowResubmission: values.allowResubmission,
          attachmentUrl: values.attachmentUrl,
        }
        await updateAssignment.mutateAsync(updateValues)
        toast.success("Assignment updated")
      } else {
        await createAssignment.mutateAsync(values)
        toast.success("Assignment created")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createAssignment.isPending || updateAssignment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit assignment" : "Create assignment"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the assignment details below."
              : "Create a new assignment for one of your classes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEdit && (
              <FormField
                control={form.control}
                name="teacherAssignmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class &amp; Subject</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingTeacherAssignments ? "Loading..." : "Select a class & subject"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teacherAssignments?.map((teacherAssignment) => (
                          <SelectItem key={teacherAssignment.id} value={teacherAssignment.id}>
                            {teacherAssignment.className} — {teacherAssignment.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Chapter 4 homework" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Marks</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment (optional)</FormLabel>
                  <FormControl>
                    <FileUploadField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowResubmission"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Allow resubmission</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Students may resubmit their work before the due date.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Create assignment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
