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
    // Insert into public users table
    await supabase().from('users').insert({
      id: data.user.id,
      email,
      username,
    })
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
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return null

  const { data } = await supabase()
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (data) return data

  // Row missing in users table (e.g. signUp insert failed) — create it now
  const fallbackUsername =
    (user.user_metadata?.username as string | undefined) ??
    user.email?.split('@')[0] ??
    'user'

  const { data: created } = await supabase()
    .from('users')
    .insert({ id: user.id, email: user.email!, username: fallbackUsername })
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
