"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item } from "@/lib/types"
import { CATEGORIES } from "@/lib/api/items"
import { cn } from "@/lib/utils"

export type FiltersState = {
  query: string
  category: string // 'all' | category
  location: string // 'all' | location
  status: string // 'all' | 'Lost' | 'Found'
}

export function ItemsFilters({
  className,
  items,
  value,
  onChange,
}: {
  className?: string
  items: Item[]
  value: FiltersState
  onChange: (next: FiltersState) => void
}) {
  const locations = Array.from(new Set(items.map((i) => i.location))).sort()
  const statuses = ["Lost", "Found"]

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-3", className)}>
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name or description"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v })}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={value.location} onValueChange={(v) => onChange({ ...value, location: v })}>
          <SelectTrigger>
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v })}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
