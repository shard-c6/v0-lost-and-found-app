"use client"

import useSWR from "swr"
import { addItem as apiAdd, deleteItem as apiDelete, getItems, updateItem as apiUpdate } from "@/lib/api/items"
import type { CreateItemPayload } from "@/lib/api/items"
import type { Item } from "@/lib/types"

export function useItems() {
  const { data, error, isLoading, mutate } = useSWR<Item[]>("items", getItems)

  const add = async (payload: CreateItemPayload) => {
    const created = await apiAdd(payload)
    // optimistic update
    await mutate((prev) => (prev ? [created, ...prev] : [created]), { revalidate: false })
    await mutate()
    return created
  }

  const update = async (id: string, updates: Partial<CreateItemPayload>) => {
    const updated = await apiUpdate(id, updates)
    await mutate((prev) => (prev ? prev.map((i) => (i.id === id ? updated : i)) : [updated]), { revalidate: false })
    await mutate()
    return updated
  }

  const remove = async (id: string) => {
    await apiDelete(id)
    await mutate((prev) => (prev ? prev.filter((i) => i.id !== id) : prev), { revalidate: false })
    await mutate()
  }

  return {
    items: data ?? [],
    isLoading,
    isError: !!error,
    add,
    update,
    remove,
    mutate,
  }
}
