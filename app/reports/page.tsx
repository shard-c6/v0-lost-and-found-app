"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useItems } from "@/lib/hooks/use-items"
import { getStatusCounts } from "@/lib/api/items"
import { getReportStats } from "@/lib/api/reports"
import AuthGate from "@/components/auth/auth-gate"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function ReportsPage() {
  const { items, isLoading } = useItems()
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    recoveryRate: 0,
    categoryBreakdown: {} as Record<string, number>,
    locationBreakdown: {} as Record<string, number>,
    statusByCategory: {} as Record<string, { lost: number; found: number }>,
    recentItems: [] as any[],
  })

  useEffect(() => {
    if (items && items.length > 0) {
      const computed = getReportStats(items)
      setStats(computed)
    }
  }, [items])

  const counts = getStatusCounts(items || [])

  const categoryData = Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }))

  const locationData = Object.entries(stats.locationBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value,
    }))

  const statusData = [
    { name: "Lost", value: counts.lost, fill: "#ef4444" },
    { name: "Found", value: counts.found, fill: "#22c55e" },
  ]

  return (
    <AuthGate>
      <div className="min-h-dvh w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalItems}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Lost Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">{stats.lostItems}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Found Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{stats.foundItems}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Recovery Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">{stats.recoveryRate}%</div>
                    </CardContent>
                  </Card>
                </section>

                {/* Charts */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                      <CardDescription>Lost vs Found items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Items by Category</CardTitle>
                      <CardDescription>Distribution across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-80 text-muted-foreground">
                          No category data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Top Locations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                    <CardDescription>Most common item locations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={locationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">
                        No location data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </AuthGate>
  )
}
