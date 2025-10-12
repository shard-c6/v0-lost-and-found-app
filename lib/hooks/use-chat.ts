"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { getThread, sendMessage, markThreadRead, getUnreadCount, hasUnreadForItem } from "@/lib/api/chats"

export function useThread(itemId: string) {
  const { data, error, mutate } = useSWR(["chat-thread", itemId], () => Promise.resolve(getThread(itemId)), {
    revalidateOnFocus: true,
  })
  return { thread: data || [], isLoading: !data && !error, error, mutate }
}

export function useUnread(email?: string) {
  const key = email ? ["unread-count", email] : null
  const { data, error, mutate } = useSWR(key, () => Promise.resolve(getUnreadCount(email!)), {
    revalidateOnFocus: true,
  })
  return { count: data || 0, isLoading: !data && !error, error, mutate }
}

export async function chatSend(itemId: string, fromEmail: string, toEmail: string, text: string) {
  sendMessage(itemId, fromEmail, toEmail, text)
  await Promise.all([
    globalMutate(["chat-thread", itemId]),
    globalMutate(["unread-count", toEmail]),
    globalMutate(["unread-count", fromEmail]),
  ])
}

export async function chatMarkRead(itemId: string, email: string) {
  markThreadRead(itemId, email)
  await Promise.all([globalMutate(["chat-thread", itemId]), globalMutate(["unread-count", email])])
}

export function getHasUnread(itemId: string, email: string) {
  return hasUnreadForItem(itemId, email)
}
