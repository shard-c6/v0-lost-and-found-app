"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Pencil, Trash2, Tag, MessageSquareText } from "lucide-react"
import type { Item, ItemStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth/use-auth"
import ChatPanel from "@/components/chat/chat-panel"
import { useState, useMemo } from "react"
import { hasUnreadForItem } from "@/lib/api/chats"

export function ItemCard({
  item,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  item: Item
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onStatusChange?: (item: Item, status: ItemStatus) => void
}) {
  const statusVariant: Record<string, string> = {
    Lost: "bg-destructive text-destructive-foreground",
    Found: "bg-chart-2 text-background",
  }

  const { user } = useAuth()
  const canChangeStatus = user?.role === "admin"

  const canChat =
    (!!item.ownerEmail && user?.role === "admin") ||
    (!!item.ownerEmail && user?.role === "student" && user.email === item.ownerEmail)

  const [chatOpen, setChatOpen] = useState(false)

  const hasUnread = useMemo(() => {
    if (!user?.email) return false
    try {
      return hasUnreadForItem(item.id, user.email)
    } catch {
      return false
    }
  }, [item.id, user?.email, chatOpen])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.name}</CardTitle>
          <Badge className={cn("capitalize", statusVariant[item.status] || "")}>{item.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Tag className="size-3.5" />
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {item.location}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex items-start gap-4">
        <div className="w-36 shrink-0">
          <img
            src={item.imageDataUrl || "/placeholder.svg?height=120&width=160&query=item%20image"}
            alt={`${item.name} image`}
            className="h-28 w-36 rounded-md border border-border object-cover"
          />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-5">{item.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <label className="sr-only" htmlFor={`status-${item.id}`}>
            Change status
          </label>
          <Select
            disabled={!canChangeStatus}
            value={item.status}
            onValueChange={(v) => onStatusChange?.(item, v as ItemStatus)}
          >
            <SelectTrigger id={`status-${item.id}`} className="h-8 w-[160px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {(["Lost", "Found"] as ItemStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {canChat && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChatOpen(true)}
              aria-label="Open chat"
              className="relative"
            >
              <MessageSquareText className="size-4 mr-2" />
              Chat
              {hasUnread && (
                <span
                  className="ml-2 inline-block h-2 w-2 rounded-full bg-destructive"
                  aria-label="Unread messages indicator"
                />
              )}
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(item)} aria-label="Edit item">
              <Pencil className="size-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(item)} aria-label="Delete item">
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
      {canChat && user && item.ownerEmail && (
        <ChatPanel
          open={chatOpen}
          onOpenChange={setChatOpen}
          item={item}
          role={user.role === "admin" ? "admin" : "student"}
          email={user.email}
          counterpartEmail={user.role === "admin" ? item.ownerEmail : "admin@school.edu"}
        />
      )}
    </Card>
  )
}

export default ItemCard
