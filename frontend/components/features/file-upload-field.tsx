"use client"

import * as React from "react"
import { Download, Loader2, Paperclip, X } from "lucide-react"
import { toast } from "sonner"

import { uploadFile, downloadFile } from "@/lib/api/files"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"

interface FileUploadFieldProps {
  value: string | null | undefined
  onChange: (key: string | null) => void
  disabled?: boolean
  accept?: string
}

/** Uploads immediately on file selection and hands the resulting storage key back via onChange. */
export function FileUploadField({ value, onChange, disabled, accept }: FileUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [selectedName, setSelectedName] = React.useState<string | null>(null)

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    try {
      const key = await uploadFile(file)
      setSelectedName(file.name)
      onChange(key)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload file"))
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove() {
    setSelectedName(null)
    onChange(null)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelected}
        disabled={disabled || isUploading}
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{selectedName ?? value}</span>
          <button
            type="button"
            onClick={() => downloadFile(value, selectedName ?? value)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Download file"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
          {isUploading ? "Uploading..." : "Attach file"}
        </Button>
      )}
    </div>
  )
}
