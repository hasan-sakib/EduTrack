"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Users, School, BookOpen, ClipboardList, ArrowRight } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import {
  useUserCount,
  useClassCount,
  useSubjectCount,
  useAssignmentCount,
  useUpcomingAssignments,
} from "@/hooks/queries/use-dashboard"
import { assignmentStatusLabels } from "@/lib/schemas/assignments"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: number | undefined
  icon: ElementType
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value ?? 0}</div>}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"

  const userCount = useUserCount(isAdmin)
  const classCount = useClassCount()
  const subjectCount = useSubjectCount()
  const assignmentCount = useAssignmentCount()
  const upcoming = useUpcomingAssignments()

  const assignmentsLabel =
    user?.role === "Teacher" ? "My Assignments" : user?.role === "Student" ? "My Assignments" : "Assignments"

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0]}`}
        description="Here's what's happening in EduTrack today."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && <StatCard title="Users" value={userCount.data} icon={Users} isLoading={userCount.isLoading} />}
        <StatCard title="Classes" value={classCount.data} icon={School} isLoading={classCount.isLoading} />
        <StatCard title="Subjects" value={subjectCount.data} icon={BookOpen} isLoading={subjectCount.isLoading} />
        <StatCard
          title={assignmentsLabel}
          value={assignmentCount.data}
          icon={ClipboardList}
          isLoading={assignmentCount.isLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming assignments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assignments">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : upcoming.data && upcoming.data.length > 0 ? (
            <div className="divide-y">
              {upcoming.data.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.className} · {assignment.subjectName} · Due{" "}
                      {format(new Date(assignment.dueDate), "PPp")}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {assignmentStatusLabels[assignment.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardList} title="No assignments yet" description="Nothing to show right now." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
