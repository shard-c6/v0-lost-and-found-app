import type { ChatMessage, ChatRole } from "@/lib/types"

const CHAT_KEY = "lf_chats_v1"
const READ_KEY = "lf_chat_reads_v1"

type ReadMap = Record<string, Record<string, string>> // email -> itemId -> ISO timestamp

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function readAll(): Record<string, ChatMessage[]> {
  if (!canUseStorage()) return {}
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ChatMessage[]>) : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, ChatMessage[]>) {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

function readReads(): ReadMap {
  if (!canUseStorage()) return {}
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? (JSON.parse(raw) as ReadMap) : {}
  } catch {
    return {}
  }
}

function writeReads(map: ReadMap) {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

function uuid() {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID()
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getLastReadAt(email: string, itemId: string): string | undefined {
  const reads = readReads()
  return reads[email]?.[itemId]
}

function setLastReadAt(email: string, itemId: string, iso: string) {
  const reads = readReads()
  if (!reads[email]) reads[email] = {}
  reads[email][itemId] = iso
  writeReads(reads)
}

export async function getThread(itemId: string): Promise<ChatMessage[]> {
  const all = readAll()
  return (all[itemId] ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function sendMessage(params: {
  itemId: string
  from: ChatRole
  senderEmail: string
  text: string
}): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: uuid(),
    itemId: params.itemId,
    from: params.from,
    senderEmail: params.senderEmail,
    text: params.text.trim(),
    createdAt: new Date().toISOString(),
  }
  if (!msg.text) throw new Error("Message cannot be empty")

  const all = readAll()
  const list = all[msg.itemId] ?? []
  list.push(msg)
  all[msg.itemId] = list
  writeAll(all)
  return msg
}

export function markThreadRead(itemId: string, userEmail: string): void {
  // mark as read up to latest message timestamp
  const all = readAll()
  const list = all[itemId] ?? []
  const last = list.length > 0 ? list[list.length - 1].createdAt : new Date().toISOString()
  setLastReadAt(userEmail, itemId, last)
}

export function hasUnreadForItem(itemId: string, userEmail: string): boolean {
  const all = readAll()
  const list = all[itemId] ?? []
  if (list.length === 0) return false
  const lastRead = getLastReadAt(userEmail, itemId)
  // unread exists if there is any message newer than lastRead and not authored by this user
  return list.some((m) => {
    const newer = !lastRead || m.createdAt > lastRead
    const notMine = m.senderEmail !== userEmail
    return newer && notMine
  })
}

export function getUnreadCount(userEmail: string): number {
  const all = readAll()
  let total = 0
  for (const itemId of Object.keys(all)) {
    const list = all[itemId] ?? []
    if (list.length === 0) continue
    const lastRead = getLastReadAt(userEmail, itemId)
    total += list.reduce((acc, m) => {
      const newer = !lastRead || m.createdAt > lastRead
      const notMine = m.senderEmail !== userEmail
      return acc + (newer && notMine ? 1 : 0)
    }, 0)
  }
  return total
}
