"use client"

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Only render this for a column the backend actually knows how to sort by — most list
 * endpoints only toggle direction on one fixed field (see each *Service.GetAllAsync), so
 * this is deliberately opt-in per column rather than assumed available on every header.
 */
export function SortableHead({
  label,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string
  sortKey: string
  activeSortKey?: string
  sortDir: "asc" | "desc"
  onSort: (key: string) => void
  className?: string
}) {
  const isActive = activeSortKey === sortKey
  const Icon = isActive ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-ml-2 inline-flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !isActive && "opacity-40")} />
      </button>
    </TableHead>
  )
}
