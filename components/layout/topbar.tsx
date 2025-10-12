"use client"

import { Menu, Sun, MoonStar, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth/use-auth"
import useSWR from "swr"
import { getUnreadCount } from "@/lib/api/chats"

export function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user, logout } = useAuth()
  const { data: unread = 0 } = useSWR(user ? ["unread", user.email] : null, () =>
    Promise.resolve(getUnreadCount(user!.email)),
  )
  return (
    <header className="flex items-center h-16 border-b border-border px-3 md:px-6 bg-background">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Open sidebar" onClick={onOpenSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <h1 className="ml-2 md:ml-0 text-lg font-semibold text-pretty">Lost &amp; Found Item Management</h1>
      <div className="ml-auto flex items-center gap-2">
        {user && (
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-5" />
            {unread > 0 && (
              <span
                aria-label={`${unread} unread messages`}
                className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 min-w-[1.25rem] text-center"
              >
                {unread}
              </span>
            )}
          </Button>
        )}
        <ThemeToggle onIcon={<Sun className="size-4" />} offIcon={<MoonStar className="size-4" />} />
        {user && (
          <Button variant="outline" size="sm" onClick={logout} aria-label="Sign out">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </header>
  )
}
