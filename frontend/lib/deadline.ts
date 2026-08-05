import { differenceInCalendarDays, differenceInHours, isPast } from "date-fns"
import { AssignmentStatus, type AssignmentStatusValue } from "@/lib/schemas/assignments"
import type { StatusTone } from "@/lib/status-styles"

export interface DeadlineInfo {
  label: string
  tone: StatusTone
}

/** Only meaningful for Published assignments — Draft/Closed have no active deadline to countdown. */
export function getDeadlineInfo(dueDate: string, status: AssignmentStatusValue): DeadlineInfo | null {
  if (status !== AssignmentStatus.Published) return null

  const due = new Date(dueDate)
  const now = new Date()

  if (isPast(due)) {
    return { label: "Overdue", tone: "destructive" }
  }

  const days = differenceInCalendarDays(due, now)

  if (days <= 0) {
    const hours = Math.max(differenceInHours(due, now), 0)
    return { label: hours <= 1 ? "Due soon" : `Due in ${hours}h`, tone: "warning" }
  }
  if (days === 1) return { label: "Due tomorrow", tone: "warning" }
  if (days <= 3) return { label: `Due in ${days}d`, tone: "warning" }
  return { label: `Due in ${days}d`, tone: "info" }
}
