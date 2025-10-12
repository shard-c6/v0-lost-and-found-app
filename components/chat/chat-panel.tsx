"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import type React from "react"

import useSWR from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getThread, sendMessage, markThreadRead } from "@/lib/api/chats"
import type { ChatMessage, ChatRole, Item } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function ChatPanel({
  open,
  onOpenChange,
  item,
  role,
  email,
  counterpartEmail,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: Item
  role: ChatRole
  email: string
  counterpartEmail: string
}) {
  const { toast } = useToast()
  const { data, mutate, isLoading } = useSWR<ChatMessage[]>(open ? ["chat", item.id] : null, () => getThread(item.id))
  const [text, setText] = useState("")
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const msgs = data ?? []

  useEffect(() => {
    // scroll to bottom on open / new message
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
    if (open && email && item?.id) {
      try {
        markThreadRead(item.id, email)
      } catch {}
    }
  }, [open, msgs.length])

  const title = useMemo(() => `Chat: ${role === "admin" ? counterpartEmail : "Admin"}`, [role, counterpartEmail])

  async function handleSend() {
    try {
      const trimmed = text.trim()
      if (!trimmed) return
      const created = await sendMessage({ itemId: item.id, from: role, senderEmail: email, text: trimmed })
      setText("")
      await mutate((prev) => [...(prev ?? []), created], { revalidate: false })
      await mutate()
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to send", description: e?.message ?? "Try again" })
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="h-72 rounded-md border border-border bg-muted/30 p-2">
            <ScrollArea className="h-full pr-2">
              <div ref={viewportRef as any} className="flex flex-col gap-2">
                {isLoading && <p className="text-xs text-muted-foreground">Loading messages…</p>}
                {msgs.map((m) => {
                  const mine = m.senderEmail === email
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted"}`}
                      aria-label={`${m.from} message`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {m.senderEmail} • {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              aria-label="Message input"
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatPanel
