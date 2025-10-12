"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { ItemFormModal } from "@/components/items/item-form"
import { useState } from "react"
import { useItems } from "@/lib/hooks/use-items"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AuthGate from "@/components/auth/auth-gate"

export default function AddItemPage() {
  const [open, setOpen] = useState(true)
  const { add } = useItems()
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(values: any) {
    try {
      await add(values)
      toast({ title: "Item added successfully" })
      router.push("/")
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e?.message ?? "Please try again", variant: "destructive" })
    }
  }

  return (
    <AuthGate>
      <div className="min-h-dvh w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6">
            <div className="max-w-xl">
              <p className="text-sm text-muted-foreground mb-3">Use this page to add a new lost or found item.</p>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>

      <ItemFormModal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </AuthGate>
  )
}
