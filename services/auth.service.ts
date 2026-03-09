import { getSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

const supabase = () => getSupabaseClient()

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) throw error

  if (data.user) {
    // Insert into public users table.
    // The on_auth_user_created trigger also does this — the ON CONFLICT
    // clause means whichever runs first wins and the second is a no-op.
    const { error: insertError } = await supabase().from('users').insert({
      id: data.user.id,
      email,
      username,
    })
    if (insertError && insertError.code !== '23505') {
      // 23505 = unique_violation (row already created by trigger) — ignore it
      console.error('users insert error:', insertError)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase().auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase().auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  // getSession() reads from localStorage — no extra network call when token is valid.
  // getUser() always hits the Auth server, causing slow/infinite loading on refresh.
  const { data: { session } } = await supabase().auth.getSession()
  const user = session?.user
  if (!user) return null
  return getUserById(user.id, user)
}

// Fetch the public users row by ID, optionally using a known auth user for fallback row creation.
// Accepts the auth user object so callers can avoid a second getSession() round-trip.
export async function getUserById(
  userId: string,
  authUser?: { email?: string; user_metadata?: Record<string, unknown> }
): Promise<User | null> {
  const { data } = await supabase()
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (data) return data

  // Row missing — create it using authUser data if available, otherwise re-fetch
  let resolvedEmail = authUser?.email
  let resolvedMeta = authUser?.user_metadata

  if (!resolvedEmail) {
    const { data: { user } } = await supabase().auth.getUser()
    resolvedEmail = user?.email
    resolvedMeta = user?.user_metadata
  }

  if (!resolvedEmail) return null

  const fallbackUsername =
    (resolvedMeta?.username as string | undefined) ??
    resolvedEmail.split('@')[0] ??
    'user'

  const { data: created } = await supabase()
    .from('users')
    .insert({ id: userId, email: resolvedEmail, username: fallbackUsername })
    .select()
    .single()

  return created ?? null
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'username' | 'avatar_url'>>
): Promise<User> {
  const { data, error } = await supabase()
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `avatars/${userId}.${ext}`

  const { error } = await supabase().storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase().storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
