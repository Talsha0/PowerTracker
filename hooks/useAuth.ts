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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Fires once after the client reads from storage — the only reliable
        // place to check the session on a fresh page load / refresh.
        if (!session?.user) {
          setUser(null)
          setLoading(false)
          return
        }
        const hasCachedUser = !!useAuthStore.getState().user
        if (!hasCachedUser) setLoading(true)
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } catch {
          // Keep the cached user on error — don't wipe it
        } finally {
          setLoading(false)
        }

      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) setUser(currentUser)
        } catch { /* silent */ }

      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, router])

  return { user, isLoading }
}
