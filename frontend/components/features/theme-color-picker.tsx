"use client"

import { Check, Palette } from "lucide-react"

import { COLOR_THEMES, useThemeColor } from "@/lib/theme-color/theme-color-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeColorPicker({ collapsed = false }: { collapsed?: boolean }) {
  const { colorTheme, setColorTheme } = useThemeColor()
  const active = COLOR_THEMES.find((t) => t.id === colorTheme) ?? COLOR_THEMES[0]

  const trigger = (
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        className={cn("gap-2", collapsed ? "w-auto justify-center px-0" : "w-full justify-start")}
        aria-label="Choose color theme"
      >
        <span
          aria-hidden
          className="size-4 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: active.swatch }}
        />
        {!collapsed && <span className="text-sm">{active.label}</span>}
      </Button>
    </PopoverTrigger>
  )

  return (
    <Popover>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">Theme: {active.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <PopoverContent side="right" align="end" className="w-56">
        <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
          <Palette className="size-3.5" />
          Color theme
        </div>
        <div className="flex flex-col gap-1">
          {COLOR_THEMES.map((themeOption) => (
            <button
              key={themeOption.id}
              type="button"
              onClick={() => setColorTheme(themeOption.id)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                themeOption.id === colorTheme ? "border-primary/40 bg-muted" : "border-transparent"
              )}
            >
              <span
                aria-hidden
                className="size-3.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: themeOption.swatch }}
              />
              <span className="flex-1 truncate">{themeOption.label}</span>
              {themeOption.id === colorTheme && <Check className="size-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
