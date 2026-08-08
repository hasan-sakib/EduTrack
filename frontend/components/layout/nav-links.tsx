"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav-config"
import type { Role } from "@/lib/schemas/common"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function NavLinks({
  role,
  onNavigate,
  collapsed = false,
}: {
  role: Role
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-label={item.label}
            className={cn(
              "group relative flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-all ease-linear",
              collapsed && "justify-center px-0",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-full bg-transparent transition-all ease-linear group-hover:bg-muted group-hover:shadow-inner" />
            )}
            <motion.span
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative z-10 inline-flex"
            >
              <Icon className="size-4" />
            </motion.span>
            {!collapsed && <span className="relative z-10">{item.label}</span>}
          </Link>
        )

        if (!collapsed) return link

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
