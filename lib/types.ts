export type ItemStatus = "Lost" | "Found"

export type Item = {
  id: string
  name: string
  description: string
  category: string
  location: string
  status: ItemStatus
  imageDataUrl?: string
  createdAt: string
  updatedAt: string
  ownerEmail?: string // track which student created/owns the item for role gating and chat
}

export type ChatRole = "admin" | "student"
export type ChatMessage = {
  id: string
  itemId: string
  from: ChatRole
  senderEmail: string
  text: string
  createdAt: string
}
