import * as React from "react"

export function useSortState(defaultSortBy?: string, defaultSortDir: "asc" | "desc" = "asc") {
  const [sortBy, setSortBy] = React.useState<string | undefined>(defaultSortBy)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(defaultSortDir)

  function toggleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir("asc")
    }
  }

  return { sortBy, sortDir, toggleSort }
}
