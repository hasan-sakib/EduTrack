import { isAxiosError } from "axios"

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string" && detail.length > 0) return detail
  }
  return fallback
}
