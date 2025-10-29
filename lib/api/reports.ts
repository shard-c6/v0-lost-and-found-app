import { createClient } from "@/lib/supabase/client"
import type { Item } from "@/lib/types"

export function getReportStats(items: Item[]) {
  const stats = {
    totalItems: items.length,
    lostItems: items.filter((i) => i.status === "Lost").length,
    foundItems: items.filter((i) => i.status === "Found").length,
    recoveryRate:
      items.length > 0 ? Math.round((items.filter((i) => i.status === "Found").length / items.length) * 100) : 0,
    categoryBreakdown: {} as Record<string, number>,
    locationBreakdown: {} as Record<string, number>,
    statusByCategory: {} as Record<string, { lost: number; found: number }>,
    recentItems: items.slice(0, 10),
  }

  // Category breakdown
  items.forEach((item) => {
    stats.categoryBreakdown[item.category] = (stats.categoryBreakdown[item.category] || 0) + 1
    if (!stats.statusByCategory[item.category]) {
      stats.statusByCategory[item.category] = { lost: 0, found: 0 }
    }
    stats.statusByCategory[item.category][item.status.toLowerCase() as "lost" | "found"]++
  })

  // Location breakdown
  items.forEach((item) => {
    stats.locationBreakdown[item.location] = (stats.locationBreakdown[item.location] || 0) + 1
  })

  return stats
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("to_user_id", userId)
    .is("read_at", null)

  if (error) {
    console.error("Error fetching unread count:", error)
    return 0
  }

  return count || 0
}

export async function getItemStats(itemId: string) {
  const supabase = createClient()
  const { data: item, error } = await supabase.from("items").select("*, owner:users(email)").eq("id", itemId).single()

  if (error) {
    console.error("Error fetching item stats:", error)
    return null
  }

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("item_id", itemId)

  return {
    ...item,
    messageCount: messageCount || 0,
  }
}
