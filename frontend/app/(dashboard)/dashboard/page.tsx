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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const STAT_TONES = {
  primary: "text-primary",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
} as const

const ACCENT_BAR_TONES = {
  neutral: "bg-muted-foreground/40",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  accent: "bg-accent-foreground",
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
    <motion.div variants={fadeInUp} className="flex flex-col gap-2 py-1">
      <Icon className={`size-5 ${STAT_TONES[tone]}`} />
      {isLoading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <div className="text-3xl font-semibold tracking-tight">
          <AnimatedNumber value={value ?? 0} />
        </div>
      )}
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={`Welcome back, ${user?.fullName.split(" ")[0]}`}
          description="Here's what's happening in EduTrack today."
        />
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <Button
              key={action.href}
              variant={i === 0 ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="size-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="my-6 grid grid-cols-2 gap-x-4 gap-y-6 border-b pb-6 sm:grid-cols-4"
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:divide-x lg:divide-muted">
        <div className="lg:col-span-2 lg:pr-8">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-semibold">Upcoming assignments</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/assignments">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          {upcoming.isLoading ? (
            <div className="space-y-3 pt-4">
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
                    className="flex items-center gap-3 py-3 pl-3 -ml-3 hover:bg-muted/50 rounded-r-md transition-colors relative"
                  >
                    <span
                      className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full ${ACCENT_BAR_TONES[assignmentStatusTone[assignment.status]]}`}
                    />
                    <div className="min-w-0 flex-1">
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
        </div>

        <div className="lg:pl-8">
          <div className="border-b pb-3">
            <h2 className="font-semibold">Activity</h2>
          </div>
          <div className="pt-4">
            <ActivityPlaceholder />
          </div>
        </div>
      </div>
    </div>
  )
}
