import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Settings,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/lib/schemas/common"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, roles: ["Admin", "Teacher", "Student"] },
  { href: "/users", label: "Users", icon: Users, roles: ["Admin"] },
  { href: "/classes", label: "Classes", icon: School, roles: ["Admin", "Teacher", "Student"] },
  { href: "/subjects", label: "Subjects", icon: BookOpen, roles: ["Admin", "Teacher", "Student"] },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, roles: ["Admin", "Teacher", "Student"] },
  { href: "/submissions", label: "Submissions", icon: FileCheck2, roles: ["Admin", "Teacher"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
]
