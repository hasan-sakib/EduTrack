"use client"

import { motion } from "framer-motion"
import { AlertCircle, RotateCw } from "lucide-react"

import { fadeInUp } from "@/lib/motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ErrorState({
  message = "Something went wrong while loading this data.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Failed to load</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              <RotateCw className="size-3.5" />
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}
