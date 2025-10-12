"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useItems } from "@/lib/hooks/use-items"
import { getStatusCounts } from "@/lib/api/items"
import AuthGate from "@/components/auth/auth-gate"

export default function ReportsPage() {
  const { items } = useItems()
  const counts = getStatusCounts(items)

  return (
    <AuthGate>
      <div className="min-h-dvh w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6 space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ReportCard title="Lost" value={counts.lost} />
              <ReportCard title="Found" value={counts.found} />
              <ReportCard title="Returned" value={counts.returned} />
            </section>
            <section className="text-sm text-muted-foreground">
              <p>More detailed reports and charts coming soon.</p>
            </section>
          </main>
        </div>
      </div>
    </AuthGate>
  )
}

function ReportCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}
