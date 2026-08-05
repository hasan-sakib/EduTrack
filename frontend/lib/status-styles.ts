import { AssignmentStatus, type AssignmentStatusValue } from "@/lib/schemas/assignments"
import { SubmissionStatus, type SubmissionStatusValue } from "@/lib/schemas/submissions"
import type { Role } from "@/lib/schemas/common"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "destructive" | "accent"

/**
 * Single source of truth for what color a status/role means, app-wide. Anything that renders a
 * status pill should read from here rather than picking a Badge variant ad hoc — this is what
 * replaces the one-off hardcoded amber classes that used to live only in the submissions table.
 */
export const toneClassName: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  accent: "bg-accent text-accent-foreground border-transparent",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/25",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
}

export const assignmentStatusTone: Record<AssignmentStatusValue, StatusTone> = {
  [AssignmentStatus.Draft]: "neutral",
  [AssignmentStatus.Published]: "success",
  [AssignmentStatus.Closed]: "warning",
}

export const submissionStatusTone: Record<SubmissionStatusValue, StatusTone> = {
  [SubmissionStatus.Submitted]: "info",
  [SubmissionStatus.Graded]: "success",
  [SubmissionStatus.Returned]: "warning",
}

export const roleTone: Record<Role, StatusTone> = {
  Admin: "accent",
  Teacher: "info",
  Student: "neutral",
}

export const activeStatusTone: Record<"active" | "inactive", StatusTone> = {
  active: "success",
  inactive: "neutral",
}

/** Audit log actions are free-text from the backend (Create/Update/Delete/Grade/...), not a fixed enum. */
export function auditActionTone(action: string): StatusTone {
  const normalized = action.toLowerCase()
  if (normalized.includes("delete")) return "destructive"
  if (normalized.includes("create") || normalized.includes("grade") || normalized.includes("login")) return "success"
  if (normalized.includes("update") || normalized.includes("statuschange") || normalized.includes("submit")) return "info"
  if (normalized.includes("logout") || normalized.includes("refresh")) return "neutral"
  return "neutral"
}
