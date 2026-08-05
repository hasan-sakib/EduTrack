"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { updateSettingSchema, type ApplicationSettingDto, type UpdateSettingFormValues } from "@/lib/schemas/settings"
import { useUpdateSetting } from "@/hooks/queries/use-settings"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface SettingEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setting: ApplicationSettingDto | null
}

export function SettingEditDialog({ open, onOpenChange, setting }: SettingEditDialogProps) {
  const updateSetting = useUpdateSetting()

  const form = useForm<UpdateSettingFormValues>({
    resolver: zodResolver(updateSettingSchema),
    defaultValues: { value: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ value: setting?.value ?? "" })
    }
  }, [open, setting, form])

  async function onSubmit(values: UpdateSettingFormValues) {
    if (!setting) return
    try {
      await updateSetting.mutateAsync({ key: setting.key, value: values.value })
      toast.success("Setting updated")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{setting?.key}</DialogTitle>
          {setting?.description && <DialogDescription>{setting.description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSetting.isPending}>
                {updateSetting.isPending && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
