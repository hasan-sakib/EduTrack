"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav-config"
import type { Role } from "@/lib/schemas/common"

export function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-md bg-linear-to-b from-primary to-primary/90 shadow-[0_2px_10px_-2px_var(--color-primary)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-md bg-transparent transition-colors group-hover:bg-muted" />
            )}
            <motion.span
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative z-10 inline-flex"
            >
              <Icon className="size-4" />
            </motion.span>
            <span className="relative z-10">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
