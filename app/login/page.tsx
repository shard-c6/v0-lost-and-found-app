"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Lock, UserRound } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast({ title: "Signed in", description: "Welcome back!" })
      router.replace("/")
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Check your credentials", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-balance">Lost & Found Portal</CardTitle>
          <CardDescription>{"Admin: admin@school.edu / admin123 \nStudent: student1@school.edu / stu1@n1\nstudent2@school.edu / stu2@n2\nstudent3@school.edu / stu3@n3"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Email</span>
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Password</span>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
