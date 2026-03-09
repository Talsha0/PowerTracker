'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { getUserById } from '@/services/auth.service'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Fires once after the client reads from storage — the only reliable
        // place to check the session on a fresh page load / refresh.
        // Use session.user directly — avoids a second getSession() call that
        // can return null if cookies haven't fully hydrated yet.
        if (!session?.user) {
          setUser(null)
          setLoading(false)
          return
        }
        const hasCachedUser = !!useAuthStore.getState().user
        if (!hasCachedUser) setLoading(true)
        try {
          const currentUser = await getUserById(session.user.id, session.user as any)
          if (currentUser) {
            setUser(currentUser)
          } else if (!hasCachedUser) {
            // DB returned null (slow/unreachable) but auth session is valid —
            // construct a minimal user so queries aren't disabled
            const su = session.user
            setUser({
              id: su.id,
              email: su.email ?? '',
              username: (su.user_metadata?.username as string | undefined) ?? su.email?.split('@')[0] ?? 'user',
              avatar_url: null,
              created_at: su.created_at ?? new Date().toISOString(),
            })
          }
          // If hasCachedUser && currentUser is null: keep the cached user
        } catch {
          // Keep the cached user on error — don't wipe it
        } finally {
          setLoading(false)
        }

      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!session?.user) return
        try {
          const currentUser = await getUserById(session.user.id, session.user as any)
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
