import { Skeleton } from "@/components/ui/skeleton"

/**
 * Column-proportioned skeleton rows for list pages — the first column reads wider (name/title),
 * later columns narrower (badges/dates/actions), so the loading state actually hints at the
 * table shape that's about to appear instead of a stack of identical full-width bars.
 */
export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  const widths = ["w-40", "w-24", "w-20", "w-16", "w-16", "w-12"]

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-6 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={`h-3.5 ${widths[i] ?? "w-16"}`} />
        ))}
      </div>
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${widths[c] ?? "w-16"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
