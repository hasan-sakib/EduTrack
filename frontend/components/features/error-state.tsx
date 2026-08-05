import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ErrorState({ message = "Something went wrong while loading this data." }: { message?: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Failed to load</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
