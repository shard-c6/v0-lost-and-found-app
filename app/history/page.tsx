"use client"

import AuthGate from "@/components/auth/auth-gate"
import { useItems } from "@/lib/hooks/use-items"
import ItemCard from "@/components/items/item-card"

export default function HistoryPage() {
  const { items } = useItems()
  const history = (items || []).filter((i) => i.status === "Found")

  return (
    <AuthGate>
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4 text-balance">Item History</h1>
        {history.length === 0 ? (
          <p className="text-muted-foreground">No items in history yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </AuthGate>
  )
}
