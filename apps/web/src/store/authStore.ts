import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  displayName: string
  totalXp: number
  currentLevel: number
  currentStreak: number
  broskiCoins: number
  prefDyslexiaFont: boolean
  prefReducedMotion: boolean
  prefHighContrast: boolean
  prefDarkMode: boolean
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User, token: string) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'hypervibe-auth' }
  )
)
