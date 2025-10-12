"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useItems } from "@/lib/hooks/use-items"
import type { Item } from "@/lib/types"
import { ItemCard } from "@/components/items/item-card"
import { ItemFormModal } from "@/components/items/item-form"
import { ItemsFilters, type FiltersState } from "@/components/items/filters"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusCounts } from "@/lib/api/items"
import AuthGate from "@/components/auth/auth-gate"

type SortKey = "newest" | "oldest" | "name-asc" | "status"

export default function HomePage() {
  const { items, isLoading, isError, add, update, remove } = useItems()
  const { toast } = useToast()

  const FILTERS_STORAGE_KEY = "lf_filters_v1"

  const [filters, setFilters] = useState<FiltersState>({
    query: "",
    category: "all",
    location: "all",
    status: "Lost",
  })
  const [sort, setSort] = useState<SortKey>("newest")
  const [isFormOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Item | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Item | undefined>(undefined)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as FiltersState & { sort?: SortKey }
        setFilters({
          query: parsed.query ?? "",
          category: parsed.category ?? "all",
          location: parsed.location ?? "all",
          status: parsed.status ?? "Lost",
        })
        if (parsed.sort) setSort(parsed.sort as SortKey)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({ ...filters, sort }))
    } catch {
      // ignore
    }
  }, [filters, sort])

  const filtered = useMemo(() => {
    const base = items.filter((i) => {
      const q = filters.query.trim().toLowerCase()
      const matchesQuery = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      const matchesCategory = filters.category === "all" || i.category === filters.category
      const matchesLocation = filters.location === "all" || i.location === filters.location
      const matchesStatus = filters.status === "all" || i.status === (filters.status as any)
      return matchesQuery && matchesCategory && matchesLocation && matchesStatus
    })
    const by = [...base]
    switch (sort) {
      case "oldest":
        by.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "name-asc":
        by.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "status":
        by.sort((a, b) => a.status.localeCompare(b.status))
        break
      case "newest":
      default:
        by.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return by
  }, [items, filters, sort])

  const counts = useMemo(() => getStatusCounts(items), [items]) // derive counts

  const onAddClick = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const onEdit = (item: Item) => {
    setEditing(item)
    setFormOpen(true)
  }

  const onDelete = (item: Item) => {
    setToDelete(item)
    setConfirmOpen(true)
  }

  async function onChangeStatus(item: Item, status: any) {
    try {
      await update(item.id, { status })
      toast({ title: "Status updated" })
    } catch (e: any) {
      toast({ title: "Failed to update status", description: e?.message ?? "Please try again", variant: "destructive" })
    }
  }

  async function handleSubmit(values: {
    name: string
    description: string
    category: string
    location: string
    status: any
    imageDataUrl?: string
    ownerEmail?: string
  }) {
    try {
      if (editing) {
        await update(editing.id, values)
        toast({ title: "Item updated successfully" })
      } else {
        await add(values)
        toast({ title: "Item added successfully" })
      }
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e?.message ?? "Please try again", variant: "destructive" })
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    try {
      await remove(toDelete.id)
      toast({ title: "Item deleted" })
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e?.message ?? "Please try again", variant: "destructive" })
    } finally {
      setConfirmOpen(false)
      setToDelete(undefined)
    }
  }

  function exportJSON() {
    try {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lost-found-items.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: "Exported JSON" })
    } catch (e: any) {
      toast({ title: "Export failed", description: e?.message ?? "Please try again", variant: "destructive" })
    }
  }

  function resetFilters() {
    setFilters({ query: "", category: "all", location: "all", status: "all" })
  }

  return (
    <AuthGate>
      <div className="min-h-dvh w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-4 md:p-6 space-y-6">
            {/* Summary */}
            <section aria-label="Summary" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryCard label="Total Lost" value={counts.lost} />
              <SummaryCard label="Total Found" value={counts.found} />
            </section>

            {/* Actions and Filters */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={onAddClick}>
                  <PlusCircle className="size-4 mr-2" />
                  Add New Item
                </Button>
                <Link href="/add-item">
                  <Button variant="outline">Open Add Item Page</Button>
                </Link>

                <div className="ml-auto flex items-center gap-2">
                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="name-asc">Name A–Z</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportJSON}>
                    Export JSON
                  </Button>
                  <Button variant="ghost" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>

              <ItemsFilters items={items} value={filters} onChange={setFilters} />
            </section>

            {/* List */}
            <section aria-label="Items List">
              {isLoading ? (
                <p className="text-muted-foreground">Loading items...</p>
              ) : isError ? (
                <p className="text-destructive">Failed to load items.</p>
              ) : (
                (() => {
                  const dashboardList = filtered.filter((i) => i.status === "Lost")
                  if (dashboardList.length === 0) {
                    return <p className="text-muted-foreground">No lost items at the moment.</p>
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {dashboardList.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onStatusChange={onChangeStatus}
                        />
                      ))}
                    </div>
                  )
                })()
              )}
            </section>
          </main>
        </div>

        {/* Add/Edit Modal */}
        <ItemFormModal open={isFormOpen} onOpenChange={setFormOpen} initialItem={editing} onSubmit={handleSubmit} />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this item?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AuthGate>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}
