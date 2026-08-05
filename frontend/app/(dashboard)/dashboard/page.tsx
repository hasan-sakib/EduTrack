"use client"

import * as React from "react"
import type { ElementType } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import {
  Users,
  School,
  BookOpen,
  ClipboardList,
  ArrowRight,
  UserPlus,
  FilePlus,
  Settings as SettingsIcon,
  ListChecks,
} from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import {
  useUserCount,
  useClassCount,
  useSubjectCount,
  useAssignmentCount,
  useUpcomingAssignments,
} from "@/hooks/queries/use-dashboard"
import { assignmentStatusTone, toneClassName } from "@/lib/status-styles"
import { assignmentStatusLabels } from "@/lib/schemas/assignments"
import { fadeInUp, staggerContainer } from "@/lib/motion"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const STAT_TONES = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
} as const

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())
  const [display, setDisplay] = React.useState("0")

  React.useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] })
    const unsubscribe = rounded.on("change", setDisplay)
    return () => {
      controls.stop()
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{display}</>
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  tone,
}: {
  title: string
  value: number | undefined
  icon: ElementType
  isLoading: boolean
  tone: keyof typeof STAT_TONES
}) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`flex size-8 items-center justify-center rounded-lg ${STAT_TONES[tone]}`}>
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={value ?? 0} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Illustrative activity overview — a static CSS visual per the design brief's "charts placeholder," not a real charting library. */
function ActivityPlaceholder() {
  const days = [
    { label: "Mon", value: 35 },
    { label: "Tue", value: 55 },
    { label: "Wed", value: 40 },
    { label: "Thu", value: 70 },
    { label: "Fri", value: 90 },
    { label: "Sat", value: 25 },
    { label: "Sun", value: 45 },
  ]

  return (
    <div className="flex h-40 items-end justify-between gap-2 px-1">
      {days.map((day, i) => (
        <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end overflow-hidden rounded-md bg-muted">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${day.value}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-md bg-primary/70"
            />
          </div>
          <span className="text-xs text-muted-foreground">{day.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin"
  const isTeacher = user?.role === "Teacher"

  const userCount = useUserCount(isAdmin)
  const classCount = useClassCount()
  const subjectCount = useSubjectCount()
  const assignmentCount = useAssignmentCount()
  const upcoming = useUpcomingAssignments()

  const assignmentsLabel = isTeacher || user?.role === "Student" ? "My Assignments" : "Assignments"

  const quickActions = isAdmin
    ? [
        { href: "/users", label: "Add User", icon: UserPlus },
        { href: "/classes", label: "Manage Classes", icon: School },
        { href: "/settings", label: "Settings", icon: SettingsIcon },
      ]
    : isTeacher
      ? [
          { href: "/assignments", label: "Create Assignment", icon: FilePlus },
          { href: "/submissions", label: "Review Submissions", icon: ListChecks },
        ]
      : [{ href: "/assignments", label: "View Assignments", icon: ClipboardList }]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0]}`}
        description="Here's what's happening in EduTrack today."
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isAdmin && (
          <StatCard title="Users" value={userCount.data} icon={Users} isLoading={userCount.isLoading} tone="primary" />
        )}
        <StatCard title="Classes" value={classCount.data} icon={School} isLoading={classCount.isLoading} tone="info" />
        <StatCard
          title="Subjects"
          value={subjectCount.data}
          icon={BookOpen}
          isLoading={subjectCount.isLoading}
          tone="success"
        />
        <StatCard
          title={assignmentsLabel}
          value={assignmentCount.data}
          icon={ClipboardList}
          isLoading={assignmentCount.isLoading}
          tone="warning"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
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
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="divide-y">
                {upcoming.data.map((assignment) => (
                  <motion.div key={assignment.id} variants={fadeInUp}>
                    <Link
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
                      <Badge className={`shrink-0 border ${toneClassName[assignmentStatusTone[assignment.status]]}`}>
                        {assignmentStatusLabels[assignment.status]}
                      </Badge>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState icon={ClipboardList} title="No assignments yet" description="Nothing to show right now." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {quickActions.map((action) => (
                <Button key={action.href} variant="outline" className="justify-start" asChild>
                  <Link href={action.href}>
                    <action.icon className="size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityPlaceholder />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
