"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

import { useClass } from "@/hooks/queries/use-classes"
import { classDisplayName } from "@/lib/schemas/classes"
import { activeStatusTone } from "@/lib/status-styles"
import { ClassStudentsDialog } from "@/components/features/classes/class-students-dialog"

import { PageHeader } from "@/components/features/page-header"
import { ErrorState } from "@/components/features/error-state"
import { StatusBadge } from "@/components/features/status-badge"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [studentsOpen, setStudentsOpen] = React.useState(false)

  const { data: classItem, isLoading, isError, refetch } = useClass(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isError || !classItem) {
    return (
      <div>
        <Link
          href="/classes"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Classes
        </Link>
        <ErrorState message="This class is not available." onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={classDisplayName(classItem)}
        description={classItem.description || undefined}
        breadcrumbs={[{ label: "Classes", href: "/classes" }, { label: classDisplayName(classItem) }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={activeStatusTone[classItem.isActive ? "active" : "inactive"]}>
              {classItem.isActive ? "Active" : "Inactive"}
            </StatusBadge>
            <Button variant="outline" onClick={() => setStudentsOpen(true)}>
              <Users />
              Students
            </Button>
          </div>
        }
      />

      <ClassStudentsDialog
        open={studentsOpen}
        onOpenChange={setStudentsOpen}
        classId={classItem.id}
        className={classDisplayName(classItem)}
      />
    </div>
  )
}
