"use client"

import { User, Users } from "lucide-react"

import { useClassStudents } from "@/hooks/queries/use-classes"
import { ErrorState } from "@/components/features/error-state"
import { EmptyState } from "@/components/features/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export function ClassStudentsDialog({
  open,
  onOpenChange,
  classId,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  className: string
}) {
  const { data: students, isLoading, isError, refetch } = useClassStudents(classId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Students</DialogTitle>
          <DialogDescription>Everyone enrolled in {className}.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Could not load students." onRetry={() => refetch()} />
        ) : students && students.length > 0 ? (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </span>
                <span className="truncate font-medium">{student.username}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Users} title="No students yet" description="No students are enrolled in this class." />
        )}
      </DialogContent>
    </Dialog>
  )
}
