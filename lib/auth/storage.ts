import type { User } from "./types"

const AUTH_KEY = "lf_current_user"

const CREDENTIALS: Record<string, { password: string; role: "admin" | "student"; name: string }> = {
  "admin@school.edu": { password: "admin123", role: "admin", name: "Administrator" },
  "student1@school.edu": { password: "stu1@n1", role: "student", name: "Student 1" },
  "student2@school.edu": { password: "stu2@n2", role: "student", name: "Student 2" },
  "student3@school.edu": { password: "stu3@n3", role: "student", name: "Student 3" },
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export async function demoLogin(email: string, password: string): Promise<User> {
  const trimmed = email.trim().toLowerCase()
  const record = CREDENTIALS[trimmed]

  if (!record || record.password !== password) {
    // The login page will surface this via toast
    throw new Error("Login is incorrect. Please try again.")
  }

  const user: User = {
    id: record.role === "admin" ? "admin-1" : `student-${trimmed}`,
    name: record.name,
    email: trimmed,
    role: record.role,
  }
  setStoredUser(user)
  return user
}

export async function demoLogout() {
  setStoredUser(null)
}
