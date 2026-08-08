"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  gradeSubmissionSchema,
  SubmissionStatus,
  type GradeSubmissionFormValues,
  type SubmissionDto,
} from "@/lib/schemas/submissions"
import { useGradeSubmission } from "@/hooks/queries/use-submissions"
import { getErrorMessage } from "@/lib/api/error"
import { downloadFile } from "@/lib/api/files"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GradeSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: SubmissionDto | null
}

function defaultStatus(submission: SubmissionDto | null): 1 | 2 {
  if (submission?.status === SubmissionStatus.Graded || submission?.status === SubmissionStatus.Returned) {
    return submission.status
  }
  return SubmissionStatus.Graded
}

export function GradeSubmissionDialog({ open, onOpenChange, submission }: GradeSubmissionDialogProps) {
  const gradeSubmission = useGradeSubmission(submission?.id ?? "")

  const form = useForm<GradeSubmissionFormValues>({
    resolver: zodResolver(gradeSubmissionSchema) as Resolver<GradeSubmissionFormValues>,
    defaultValues: { marks: 0, feedback: "", status: SubmissionStatus.Graded },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        marks: submission?.marks ?? 0,
        feedback: submission?.feedback ?? "",
        status: defaultStatus(submission),
      })
    }
  }, [open, submission, form])

  async function onSubmit(values: GradeSubmissionFormValues) {
    try {
      await gradeSubmission.mutateAsync(values)
      toast.success("Submission graded")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSubmitting = gradeSubmission.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade submission</DialogTitle>
          <DialogDescription>
            {submission
              ? `Review and grade ${submission.studentName}'s submission for "${submission.assignmentTitle}".`
              : "Review and grade this submission."}
          </DialogDescription>
        </DialogHeader>

        {submission && (submission.content || submission.fileUrl) && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
            {submission.content && (
              <div>
                <p className="mb-1 text-muted-foreground">Student&apos;s answer</p>
                <p className="whitespace-pre-wrap">{submission.content}</p>
              </div>
            )}
            {submission.fileUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadFile(submission.fileUrl!, `${submission.studentName}-submission`)}
              >
                <Download className="size-4" />
                Download submitted file
              </Button>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>out of {submission?.maxMarks ?? 0}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={String(SubmissionStatus.Graded)}>Graded</SelectItem>
                      <SelectItem value={String(SubmissionStatus.Returned)}>Returned</SelectItem>
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
                Save grade
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
