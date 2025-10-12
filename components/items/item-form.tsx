"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CATEGORIES } from "@/lib/api/items"
import type { Item, ItemStatus } from "@/lib/types"
import { useAuth } from "@/lib/auth/use-auth"

type FormState = {
  name: string
  description: string
  category: string
  location: string
  status: ItemStatus
  imageDataUrl?: string
  ownerEmail?: string
}

const initial: FormState = {
  name: "",
  description: "",
  category: "",
  location: "",
  status: "Lost",
  imageDataUrl: undefined,
  ownerEmail: undefined,
}

export function ItemFormModal({
  open,
  onOpenChange,
  initialItem,
  onSubmit,
  submitting = false,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialItem?: Item
  submitting?: boolean
  onSubmit: (values: FormState) => Promise<void> | void
}) {
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      if (initialItem) {
        setValues({
          name: initialItem.name,
          description: initialItem.description,
          category: initialItem.category,
          location: initialItem.location,
          status: initialItem.status === "Found" ? "Found" : "Lost",
          imageDataUrl: initialItem.imageDataUrl,
          ownerEmail: initialItem.ownerEmail,
        })
      } else {
        setValues((prev) => ({
          ...initial,
          status: "Lost",
          ownerEmail: user?.role === "student" ? user.email : undefined,
        }))
      }
      setErrors({})
    }
  }, [open, initialItem, user])

  function validate(v: FormState) {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!v.name.trim()) e.name = "Item name is required"
    if (!v.description.trim()) e.description = "Description is required"
    if (!v.category.trim()) e.category = "Category is required"
    if (!v.location.trim()) e.location = "Location is required"
    if (!v.status) e.status = "Status is required"
    return e
  }

  async function handleSubmit() {
    const e = validate(values)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    await onSubmit(values)
    onOpenChange(false)
  }

  async function onFileChange(file: File | null) {
    if (!file) {
      setValues((p) => ({ ...p, imageDataUrl: undefined }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => setValues((p) => ({ ...p, imageDataUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const title = initialItem ? "Edit Item" : "Add New Item"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill out the fields below. Required fields are marked with *</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Item Name{" "}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">
              Description{" "}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              rows={4}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                Category{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </Label>
              <Select value={values.category} onValueChange={(v) => setValues((p) => ({ ...p, category: v }))}>
                <SelectTrigger aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">
                Location{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </Label>
              <Input
                id="location"
                value={values.location}
                onChange={(e) => setValues((p) => ({ ...p, location: e.target.value }))}
                aria-invalid={!!errors.location}
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>
          </div>

          {/* Status - admin only */}
          {user?.role === "admin" && (
            <div className="grid gap-2">
              <Label>
                Status{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </Label>
              <Select
                value={values.status}
                onValueChange={(v) => setValues((p) => ({ ...p, status: v as ItemStatus }))}
              >
                <SelectTrigger aria-invalid={!!errors.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {["Lost", "Found"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="image">Image Upload (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {values.imageDataUrl ? (
              <img
                alt="Preview"
                src={values.imageDataUrl || "/placeholder.svg"}
                className="mt-2 h-28 w-auto rounded-md border border-border object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
