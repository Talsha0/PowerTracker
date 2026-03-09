'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { getCurrentUser } from '@/services/auth.service'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()

    const loadUser = async () => {
      // Only show the spinner when there is no cached user at all.
      // With a persisted user, refresh happens silently in the background.
      const hasCachedUser = !!useAuthStore.getState().user
      if (!hasCachedUser) setLoading(true)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        if (!hasCachedUser) setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, router])

  return { user, isLoading }
}
