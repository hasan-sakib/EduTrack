"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Award, BookOpen, CalendarClock, Loader2, RefreshCcw, Tag } from "lucide-react"
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
import { MultiFileUploadField } from "@/components/features/multi-file-upload-field"
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

function SidebarLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <FormLabel className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5" />
      {children}
    </FormLabel>
  )
}

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
      topic: "",
      attachments: [],
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
        topic: assignmentToEdit?.topic ?? "",
        attachments: assignmentToEdit?.attachments.map((a) => ({ fileUrl: a.fileUrl, fileName: a.fileName })) ?? [],
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
          topic: values.topic?.trim() || null,
          attachments: values.attachments,
        }
        await updateAssignment.mutateAsync(updateValues)
        toast.success("Assignment updated")
      } else {
        await createAssignment.mutateAsync({ ...values, topic: values.topic?.trim() || null })
        toast.success("Assignment created and published to the class")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createAssignment.isPending || updateAssignment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
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
            <div className="grid max-h-[65vh] gap-6 overflow-y-auto pr-1 sm:grid-cols-3">
              {/* Main column: title, instructions, attachments */}
              <div className="space-y-4 sm:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Assignment title"
                          className="h-auto border-none px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="border-t" />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Add instructions for students..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachments</FormLabel>
                      <FormControl>
                        <MultiFileUploadField value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sidebar column: settings */}
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4 sm:col-span-1">
                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="teacherAssignmentId"
                    render={({ field }) => (
                      <FormItem>
                        <SidebarLabel icon={BookOpen}>Class &amp; Subject</SidebarLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-background">
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
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <SidebarLabel icon={Tag}>Topic</SidebarLabel>
                      <FormControl>
                        <Input placeholder="e.g. Unit 3" className="bg-background" {...field} value={field.value ?? ""} />
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
                      <SidebarLabel icon={Award}>Points</SidebarLabel>
                      <FormControl>
                        <Input type="number" min={1} className="bg-background" {...field} />
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
                      <SidebarLabel icon={CalendarClock}>Due date</SidebarLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowResubmission"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-2 pt-1">
                      <SidebarLabel icon={RefreshCcw}>Allow resubmission</SidebarLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
