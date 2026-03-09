import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/database'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  weeklyGoals: {
    workoutsPerWeek?: number
    runningDistanceKm?: number
    gymSessionsPerWeek?: number
  }
  setWeeklyGoals: (goals: AuthState['weeklyGoals']) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      weeklyGoals: {},
      setWeeklyGoals: (weeklyGoals) => set({ weeklyGoals }),
    }),
    {
      name: 'powertracker-auth',
      partialize: (state) => ({
        user: state.user,
        weeklyGoals: state.weeklyGoals,
      }),
    }
  )
)
