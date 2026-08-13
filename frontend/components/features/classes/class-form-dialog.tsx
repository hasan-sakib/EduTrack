"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  createClassSchema,
  updateClassSchema,
  type ClassDto,
  type CreateClassFormValues,
  type UpdateClassFormValues,
} from "@/lib/schemas/classes"
import { useCreateClass, useUpdateClass } from "@/hooks/queries/use-classes"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface ClassFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classToEdit?: ClassDto | null
}

export function ClassFormDialog({ open, onOpenChange, classToEdit }: ClassFormDialogProps) {
  const isEdit = !!classToEdit
  const createClass = useCreateClass()
  const updateClass = useUpdateClass(classToEdit?.id ?? "")

  const form = useForm<CreateClassFormValues & { isActive?: boolean }>({
    resolver: zodResolver(isEdit ? updateClassSchema : createClassSchema),
    defaultValues: { name: "", section: "", description: "", isActive: true },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: classToEdit?.name ?? "",
        section: classToEdit?.section ?? "",
        description: classToEdit?.description ?? "",
        isActive: classToEdit?.isActive ?? true,
      })
    }
  }, [open, classToEdit, form])

  async function onSubmit(values: CreateClassFormValues & { isActive?: boolean }) {
    const payload = { ...values, section: values.section?.trim() || null }
    try {
      if (isEdit) {
        await updateClass.mutateAsync(payload as UpdateClassFormValues)
        toast.success("Class updated")
      } else {
        await createClass.mutateAsync(payload)
        toast.success("Class created")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = createClass.isPending || updateClass.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit class" : "Add class"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the class details below." : "Create a new class for organizing students."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Grade 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="A" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
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
                      <p className="text-sm text-muted-foreground">Inactive classes are hidden from new assignments.</p>
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
                {isEdit ? "Save changes" : "Create class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
