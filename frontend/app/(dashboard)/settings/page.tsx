"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { History, Search, Settings2 } from "lucide-react"

import { useSettings } from "@/hooks/queries/use-settings"
import { useAuditLogs } from "@/hooks/queries/use-audit-logs"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { auditActionTone } from "@/lib/status-styles"
import { fadeIn, staggerContainer, fadeInUp } from "@/lib/motion"
import type { ApplicationSettingDto } from "@/lib/schemas/settings"

import { PageHeader } from "@/components/features/page-header"
import { EmptyState } from "@/components/features/empty-state"
import { ErrorState } from "@/components/features/error-state"
import { PaginationFooter } from "@/components/features/pagination-footer"
import { SettingEditDialog } from "@/components/features/settings/setting-edit-dialog"
import { TableSkeleton } from "@/components/features/table-skeleton"
import { StatusBadge } from "@/components/features/status-badge"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SETTING_LABELS: Record<string, string> = {
  SystemName: "System Name",
  MaxUploadSizeMB: "Max Upload Size (MB)",
  AllowedFileExtensions: "Allowed File Extensions",
}

function settingLabel(key: string): string {
  return SETTING_LABELS[key] ?? key
}

export default function SettingsPage() {
  const [editingSetting, setEditingSetting] = React.useState<ApplicationSettingDto | null>(null)

  const { data: settings, isLoading: settingsLoading, isError: settingsError, refetch: refetchSettings } = useSettings()

  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search)

  const {
    data: auditData,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useAuditLogs({ page, pageSize: 10, search: debouncedSearch })

  return (
    <div>
      <PageHeader title="Settings" description="Configure system-wide application settings." />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          {settingsError ? (
            <ErrorState message="Could not load settings. Please try again." onRetry={() => refetchSettings()} />
          ) : settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
              {settings?.map((setting) => (
                <motion.div key={setting.id} variants={fadeInUp}>
                  <Card className="shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Settings2 className="size-4" />
                        </div>
                        <CardTitle>{settingLabel(setting.key)}</CardTitle>
                      </div>
                      {setting.description && (
                        <CardDescription className="pt-1">{setting.description}</CardDescription>
                      )}
                      <CardAction>
                        <Button variant="outline" size="sm" onClick={() => setEditingSetting(setting)}>
                          Edit
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <p className="rounded-md bg-muted/40 px-3 py-2 font-mono text-sm">{setting.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="audit-log" className="mt-4">
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search audit log..."
              className="pl-8"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
            {auditError ? (
              <div className="p-6">
                <ErrorState message="Could not load audit logs. Please try again." onRetry={() => refetchAudit()} />
              </div>
            ) : auditLoading ? (
              <TableSkeleton columns={6} />
            ) : auditData && auditData.items.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={page} initial="hidden" animate="visible" variants={fadeIn}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="hidden md:table-cell">Details</TableHead>
                          <TableHead className="hidden md:table-cell">IP Address</TableHead>
                          <TableHead>When</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditData.items.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <StatusBadge tone={auditActionTone(log.action)}>{log.action}</StatusBadge>
                            </TableCell>
                            <TableCell className="font-medium">{log.entityName}</TableCell>
                            <TableCell className="text-muted-foreground">{log.userName ?? "—"}</TableCell>
                            <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                              {log.details || "—"}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground md:table-cell">
                              {log.ipAddress ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(log.createdAt), "PPp")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                </AnimatePresence>
                <PaginationFooter
                  page={auditData.page}
                  totalPages={auditData.totalPages}
                  totalCount={auditData.totalCount}
                  pageSize={auditData.pageSize}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <EmptyState
                icon={History}
                title="No audit log entries"
                description="No activity has been recorded matching your search."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SettingEditDialog
        open={!!editingSetting}
        onOpenChange={(open) => !open && setEditingSetting(null)}
        setting={editingSetting}
      />
    </div>
  )
}
