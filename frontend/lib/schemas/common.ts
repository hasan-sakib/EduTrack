export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PagedQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export const ROLES = ["Admin", "Teacher", "Student"] as const
export type Role = (typeof ROLES)[number]
