import type { Item, ItemStatus } from "@/lib/types"

// Mock in-memory DB
let ITEMS: Item[] = [
  {
    id: uuid(),
    name: "Black Backpack",
    description: "Black canvas backpack with a laptop sleeve. Contains notebooks.",
    category: "Bags",
    location: "Library - 2nd Floor",
    status: "Lost",
    imageDataUrl: "/black-backpack.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuid(),
    name: "Silver Water Bottle",
    description: "Stainless steel bottle with stickers.",
    category: "Accessories",
    location: "Gym",
    status: "Found",
    imageDataUrl: "/silver-water-bottle.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuid(),
    name: "AirPods Case",
    description: "White charging case. No earbuds inside.",
    category: "Electronics",
    location: "Cafeteria",
    status: "Found", // was "Returned"
    imageDataUrl: "/generic-earbuds-case.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const CATEGORIES = ["Electronics", "Bags", "Accessories", "Clothing", "Documents", "Other"]

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms))
}

const STORAGE_KEY = "lf_items_v1"

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function readStorage(): Item[] | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Item[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStorage(items: Item[]) {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota errors
  }
}

function normalize(items: Item[]): Item[] {
  return items.map((i) => (i.status === "Found" || i.status === "Lost" ? i : { ...i, status: "Found" }))
}

// Placeholder API: replace with real HTTP calls later
export async function getItems(): Promise<Item[]> {
  await delay()
  const stored = readStorage()
  if (stored) {
    ITEMS = normalize(stored)
    return [...ITEMS]
  }
  // seed storage on first run
  writeStorage(ITEMS)
  return [...ITEMS]
}

export async function addItem(input: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item> {
  await delay()
  const base = readStorage() ?? ITEMS
  const now = new Date().toISOString()
  const item: Item = { ...input, id: uuid(), updatedAt: now, createdAt: now }
  const next = [item, ...base]
  ITEMS = next
  writeStorage(next)
  return item
}

export async function updateItem(id: string, updates: Partial<Omit<Item, "id" | "createdAt">>): Promise<Item> {
  await delay()
  const base = normalize(readStorage() ?? ITEMS)
  const idx = base.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Item not found")
  const nextStatus =
    updates.status && (updates.status === "Found" || updates.status === "Lost") ? updates.status : undefined
  const updated: Item = {
    ...base[idx],
    ...(nextStatus ? { status: nextStatus } : {}),
    ...Object.fromEntries(Object.entries(updates).filter(([k]) => k !== "status")),
    updatedAt: new Date().toISOString(),
  }
  const next = [...base]
  next[idx] = updated
  ITEMS = next
  writeStorage(next)
  return updated
}

export async function deleteItem(id: string): Promise<void> {
  await delay()
  const base = readStorage() ?? ITEMS
  const next = base.filter((i) => i.id !== id)
  ITEMS = next
  writeStorage(next)
}

export function getStatusCounts(items: Item[]) {
  const norm = normalize(items)
  return {
    lost: norm.filter((i) => i.status === "Lost").length,
    found: norm.filter((i) => i.status === "Found").length,
  }
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

function uuid() {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID()
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
