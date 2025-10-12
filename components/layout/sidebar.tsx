"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, PlusCircle, BarChart3, PackageSearch, History } from "lucide-react"

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/add-item", label: "Add Item", icon: PlusCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 h-16 border-b">
        <PackageSearch className="size-5 text-sidebar-primary" />
        <span className="font-semibold">Lost &amp; Found</span>
      </div>
      <nav className="p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto p-4 text-xs text-muted-foreground">
        <p>Dashboard-style interface</p>
      </div>
    </aside>
  )
}
