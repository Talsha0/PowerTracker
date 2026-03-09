import { getSupabaseClient } from '@/lib/supabase/client'
import type { ExerciseLibrary } from '@/types/database'

const supabase = () => getSupabaseClient()

export async function getExerciseLibrary(userId: string): Promise<ExerciseLibrary[]> {
  const { data, error } = await supabase()
    .from('exercise_library')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function createCustomExercise(
  userId: string,
  name: string,
  imageUrl?: string
): Promise<ExerciseLibrary> {
  const { data, error } = await supabase()
    .from('exercise_library')
    .insert({ user_id: userId, name, image_url: imageUrl ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadExerciseImage(
  userId: string,
  exerciseId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `exercises/${userId}/${exerciseId}.${ext}`

  const { error } = await supabase().storage
    .from('exercise-images')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase().storage.from('exercise-images').getPublicUrl(path)
  return data.publicUrl
}

export async function updateExerciseImage(
  exerciseId: string,
  imageUrl: string
): Promise<void> {
  const { error } = await supabase()
    .from('exercise_library')
    .update({ image_url: imageUrl })
    .eq('id', exerciseId)

  if (error) throw error
}
