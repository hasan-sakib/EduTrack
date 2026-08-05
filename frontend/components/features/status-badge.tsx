import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { toneClassName, type StatusTone } from "@/lib/status-styles"
import { cn } from "@/lib/utils"

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: React.ReactNode
  className?: string
}) {
  return <Badge className={cn("border font-medium", toneClassName[tone], className)}>{children}</Badge>
}
