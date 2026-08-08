"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { LogOut, Menu, User as UserIcon } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import { NavLinks } from "@/components/layout/nav-links"
import { ThemeToggle } from "@/components/features/theme-toggle"
import { toneClassName, roleTone } from "@/lib/status-styles"
import { cn, getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const SIDEBAR_COLLAPSED_KEY = "edutrack:sidebar-collapsed"

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Image src="/logo-icon.png" alt="EduTrack" width={32} height={32} className="shrink-0" priority />
      <span className="text-base font-semibold tracking-tight">EduTrack</span>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true")
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <header
        className={cn(
          "sticky top-0 z-20 flex h-16 items-center gap-1 border-b bg-background/95 px-4 backdrop-blur transition-shadow duration-200 supports-backdrop-filter:bg-background/75",
          "after:absolute after:inset-x-0 after:top-full after:h-px after:bg-linear-to-r after:from-primary/40 after:via-primary/10 after:to-transparent",
          "relative",
          scrolled && "shadow-sm"
        )}
      >
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle asChild>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <NavLinks role={user.role} onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
        >
          <Menu className="size-4" />
        </Button>

        <Link href="/dashboard">
          <Logo />
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Badge className={cn("hidden border sm:inline-flex", toneClassName[roleTone[user.role]])}>
            {user.role}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user.fullName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium">{user.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon className="size-4" />
                {user.role}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden shrink-0 border-r bg-background transition-[width] duration-200 md:flex md:flex-col",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks role={user.role} collapsed={collapsed} />
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
