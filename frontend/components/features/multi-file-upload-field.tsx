"use client"

import * as React from "react"
import { Download, Loader2, Paperclip, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { uploadFile, downloadFile } from "@/lib/api/files"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"

export interface AttachmentValue {
  fileUrl: string
  fileName: string
}

interface MultiFileUploadFieldProps {
  value: AttachmentValue[]
  onChange: (attachments: AttachmentValue[]) => void
  disabled?: boolean
}

/** Attaches multiple files, each uploaded immediately on selection, matching Google Classroom's
 *  "add several attachments" pattern — unlike FileUploadField, which holds a single file. */
export function MultiFileUploadField({ value, onChange, disabled }: MultiFileUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    try {
      const key = await uploadFile(file)
      onChange([...value, { fileUrl: key, fileName: file.name }])
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload file"))
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
        disabled={disabled || isUploading}
      />
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((attachment, index) => (
            <li
              key={`${attachment.fileUrl}-${index}`}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{attachment.fileName}</span>
              <button
                type="button"
                onClick={() => downloadFile(attachment.fileUrl, attachment.fileName)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Download ${attachment.fileName}`}
              >
                <Download className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${attachment.fileName}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
        {isUploading ? "Uploading..." : "Add attachment"}
      </Button>
    </div>
  )
}
