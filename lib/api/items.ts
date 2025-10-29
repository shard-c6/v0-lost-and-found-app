import type { Item, ItemStatus } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export const CATEGORIES = ["Electronics", "Bags", "Accessories", "Clothing", "Documents", "Other"]

const ITEMS_STORAGE_KEY = "lost_found_items"

function getLocalItems(): Item[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLocalItems(items: Item[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  } catch {
    console.error("[v0] Failed to save items to localStorage")
  }
}

export async function getItems(): Promise<Item[]> {
  const supabase = createClient()
  try {
    console.log("[v0] Attempting to fetch items from Supabase...")
    const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false })

    if (error) {
      console.warn("[v0] Supabase error, falling back to localStorage:", error.message)
      return getLocalItems()
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      location: item.location,
      status: item.status as ItemStatus,
      imageDataUrl: item.image_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      ownerEmail: item.owner_email,
    }))
  } catch (err) {
    console.warn("[v0] Exception fetching from Supabase, falling back to localStorage:", err)
    return getLocalItems()
  }
}

export async function addItem(
  input: Omit<Item, "id" | "createdAt" | "updatedAt">,
  userId: string,
  userEmail: string,
): Promise<Item> {
  const supabase = createClient()

  try {
    console.log("[v0] Attempting to add item to Supabase...")
    const { data, error } = await supabase
      .from("items")
      .insert({
        name: input.name,
        description: input.description,
        category: input.category,
        location: input.location,
        status: input.status || "Lost",
        image_url: input.imageDataUrl || null,
        owner_id: userId,
        owner_email: userEmail,
      })
      .select()
      .single()

    if (error) {
      console.warn("[v0] Supabase error, falling back to localStorage:", error.message)
      const newItem: Item = {
        id: `local-${Date.now()}-${Math.random()}`,
        name: input.name,
        description: input.description,
        category: input.category,
        location: input.location,
        status: input.status || "Lost",
        imageDataUrl: input.imageDataUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerEmail: userEmail,
      }
      const items = getLocalItems()
      items.unshift(newItem)
      saveLocalItems(items)
      return newItem
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      location: data.location,
      status: data.status,
      imageDataUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ownerEmail: data.owner_email,
    }
  } catch (err) {
    console.warn("[v0] Exception adding to Supabase, falling back to localStorage:", err)
    const newItem: Item = {
      id: `local-${Date.now()}-${Math.random()}`,
      name: input.name,
      description: input.description,
      category: input.category,
      location: input.location,
      status: input.status || "Lost",
      imageDataUrl: input.imageDataUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerEmail: userEmail,
    }
    const items = getLocalItems()
    items.unshift(newItem)
    saveLocalItems(items)
    return newItem
  }
}

export async function updateItem(id: string, updates: Partial<Omit<Item, "id" | "createdAt">>): Promise<Item> {
  const supabase = createClient()

  try {
    const updateObj: any = {}
    if (updates.name !== undefined) updateObj.name = updates.name
    if (updates.description !== undefined) updateObj.description = updates.description
    if (updates.category !== undefined) updateObj.category = updates.category
    if (updates.location !== undefined) updateObj.location = updates.location
    if (updates.status !== undefined) {
      updateObj.status = updates.status
      updateObj.found_at = updates.status === "Found" ? new Date().toISOString() : null
    }
    if (updates.imageDataUrl !== undefined) updateObj.image_url = updates.imageDataUrl

    const { data, error } = await supabase.from("items").update(updateObj).eq("id", id).select().single()

    if (error) {
      console.warn("[v0] Supabase error, falling back to localStorage:", error.message)
      const items = getLocalItems()
      const idx = items.findIndex((i) => i.id === id)
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
        saveLocalItems(items)
        return items[idx]
      }
      throw new Error("Item not found")
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      location: data.location,
      status: data.status,
      imageDataUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ownerEmail: data.owner_email,
    }
  } catch (err) {
    console.warn("[v0] Exception updating in Supabase, falling back to localStorage:", err)
    const items = getLocalItems()
    const idx = items.findIndex((i) => i.id === id)
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
      saveLocalItems(items)
      return items[idx]
    }
    throw new Error("Item not found")
  }
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase.from("items").delete().eq("id", id)
    if (error) {
      console.warn("[v0] Supabase error, falling back to localStorage:", error.message)
      const items = getLocalItems()
      const filtered = items.filter((i) => i.id !== id)
      saveLocalItems(filtered)
      return
    }
  } catch (err) {
    console.warn("[v0] Exception deleting from Supabase, falling back to localStorage:", err)
    const items = getLocalItems()
    const filtered = items.filter((i) => i.id !== id)
    saveLocalItems(filtered)
  }
}

export function getStatusCounts(items: Item[]) {
  return {
    lost: items.filter((i) => i.status === "Lost").length,
    found: items.filter((i) => i.status === "Found").length,
  }
}

export function getCategoryBreakdown(items: Item[]) {
  const breakdown: Record<string, number> = {}
  items.forEach((item) => {
    breakdown[item.category] = (breakdown[item.category] || 0) + 1
  })
  return breakdown
}

export function getLocationBreakdown(items: Item[]) {
  const breakdown: Record<string, number> = {}
  items.forEach((item) => {
    breakdown[item.location] = (breakdown[item.location] || 0) + 1
  })
  return breakdown
}

export type CreateItemPayload = {
  name: string
  description: string
  category: string
  location: string
  status: ItemStatus
  imageDataUrl?: string
  ownerEmail?: string
}
