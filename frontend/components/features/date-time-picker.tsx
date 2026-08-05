"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

/** Date + time picker that works directly in ISO strings, so callers never need datetime-local conversion helpers. */
export function DateTimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (iso: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value) : undefined
  const isValidDate = date && !Number.isNaN(date.getTime())

  const timeValue = isValidDate
    ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : "12:00"

  function updateDate(nextDate: Date | undefined) {
    if (!nextDate) return
    const merged = new Date(nextDate)
    const [h, m] = timeValue.split(":").map(Number)
    merged.setHours(h, m, 0, 0)
    onChange(merged.toISOString())
    setOpen(false)
  }

  function updateTime(nextTime: string) {
    if (!nextTime) return
    const base = isValidDate ? new Date(date) : new Date()
    const [h, m] = nextTime.split(":").map(Number)
    base.setHours(h, m, 0, 0)
    onChange(base.toISOString())
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("flex-1 justify-start font-normal", !isValidDate && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4" />
            {isValidDate ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={updateDate} autoFocus />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timeValue}
        onChange={(event) => updateTime(event.target.value)}
        disabled={disabled}
        className="w-28"
      />
    </div>
  )
}
