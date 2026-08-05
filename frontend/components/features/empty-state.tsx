"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { fadeInUp } from "@/lib/motion"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-linear-to-b from-muted to-muted/50 ring-1 ring-border">
        <Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-balance">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
