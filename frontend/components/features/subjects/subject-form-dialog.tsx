"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  createSubjectSchema,
  updateSubjectSchema,
  type SubjectDto,
  type CreateSubjectFormValues,
  type UpdateSubjectFormValues,
} from "@/lib/schemas/subjects"
import { useCreateSubject, useUpdateSubject } from "@/hooks/queries/use-subjects"
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

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectToEdit?: SubjectDto | null
}

export function SubjectFormDialog({ open, onOpenChange, subjectToEdit }: SubjectFormDialogProps) {
  const isEdit = !!subjectToEdit
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject(subjectToEdit?.id ?? "")

  const form = useForm<CreateSubjectFormValues & { isActive?: boolean }>({
    resolver: zodResolver(isEdit ? updateSubjectSchema : createSubjectSchema),
    defaultValues: { name: "", code: "", isActive: true },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: subjectToEdit?.name ?? "",
        code: subjectToEdit?.code ?? "",
        isActive: subjectToEdit?.isActive ?? true,
      })
    }
  }, [open, subjectToEdit, form])

  async function onSubmit(values: CreateSubjectFormValues & { isActive?: boolean }) {
    try {
      if (isEdit) {
        await updateSubject.mutateAsync(values as UpdateSubjectFormValues)
        toast.success("Subject updated")
      } else {
        await createSubject.mutateAsync(values)
        toast.success("Subject created")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createSubject.isPending || updateSubject.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the subject details below." : "Create a new subject for organizing coursework."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="MATH101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Inactive subjects are hidden from new assignments.</p>
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
                {isEdit ? "Save changes" : "Create subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
