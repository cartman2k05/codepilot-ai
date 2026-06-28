import { create } from "zustand"

interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (token, user) => {
    localStorage.setItem("codepilot_token", token)
    localStorage.setItem("codepilot_user", JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem("codepilot_token")
    localStorage.removeItem("codepilot_user")
    set({ token: null, user: null, isAuthenticated: false })
  },
  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("codepilot_token")
      const userStr = localStorage.getItem("codepilot_user")
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          set({ token, user, isAuthenticated: true })
        } catch {
          localStorage.removeItem("codepilot_token")
          localStorage.removeItem("codepilot_user")
        }
      }
    }
  }
}))
