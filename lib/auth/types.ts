export type Role = "student" | "admin"

export interface User {
  id: string
  name: string
  email?: string
  role: Role
}
